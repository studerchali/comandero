import { SYNC_ENABLED } from '../constants/app'
import { SYNC_META_KEY } from '../constants/storage'
import type { PersistedRestaurantState } from '../types/restaurant'
import {
  fetchHealth,
  fetchRemoteState,
  pushRemoteState,
  type SyncRecord,
} from './apiClient'

export type SyncStatus =
  | 'idle'
  | 'syncing'
  | 'synced'
  | 'offline'
  | 'error'
  | 'conflict'
  | 'disabled'

interface SyncMeta {
  clientId: string
  updatedAt: string
  lastSyncedAt: string | null
}

const PUSH_DEBOUNCE_MS = 2000

let pushTimer: ReturnType<typeof setTimeout> | null = null
let lastConflict: SyncRecord | null = null

function readMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY)
    if (raw) return JSON.parse(raw) as SyncMeta
  } catch {
    /* ignore corrupt meta */
  }
  return {
    clientId: '',
    updatedAt: new Date(0).toISOString(),
    lastSyncedAt: null,
  }
}

export function getSyncMeta(): SyncMeta {
  const meta = readMeta()
  if (meta.clientId) return meta
  const clientId = `client-${crypto.randomUUID()}`
  const next = { ...meta, clientId }
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(next))
  return next
}

export function setSyncMeta(partial: Partial<SyncMeta>): void {
  const current = getSyncMeta()
  const next: SyncMeta = {
    clientId: partial.clientId ?? current.clientId,
    updatedAt: partial.updatedAt ?? current.updatedAt,
    lastSyncedAt:
      partial.lastSyncedAt !== undefined ? partial.lastSyncedAt : current.lastSyncedAt,
  }
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(next))
}

export function getLastConflict(): SyncRecord | null {
  return lastConflict
}

export function clearConflict(): void {
  lastConflict = null
}

export function applyRemoteState(record: SyncRecord): PersistedRestaurantState {
  setSyncMeta({
    updatedAt: record.updatedAt,
    clientId: record.clientId,
    lastSyncedAt: new Date().toISOString(),
  })
  lastConflict = null
  return record.state
}

async function isServerReachable(): Promise<boolean> {
  if (!navigator.onLine) return false
  return fetchHealth()
}

function winningTimestamp(serverUpdatedAt?: string): string {
  const serverMs = serverUpdatedAt ? new Date(serverUpdatedAt).getTime() : 0
  return new Date(Math.max(Date.now(), serverMs + 1)).toISOString()
}

export async function pullState(): Promise<{
  applied: boolean
  record: SyncRecord | null
  status: SyncStatus
}> {
  if (!SYNC_ENABLED) {
    return { applied: false, record: null, status: 'disabled' }
  }

  if (!(await isServerReachable())) {
    return { applied: false, record: null, status: 'offline' }
  }

  try {
    const remote = await fetchRemoteState()
    if (!remote) {
      return { applied: false, record: null, status: 'synced' }
    }

    const meta = getSyncMeta()
    const remoteTime = new Date(remote.updatedAt).getTime()
    const localTime = new Date(meta.updatedAt).getTime()

    if (remoteTime > localTime) {
      return { applied: true, record: remote, status: 'synced' }
    }

    return { applied: false, record: remote, status: 'synced' }
  } catch {
    return { applied: false, record: null, status: 'error' }
  }
}

export async function pushState(slice: PersistedRestaurantState): Promise<SyncStatus> {
  if (!SYNC_ENABLED) return 'disabled'

  if (!(await isServerReachable())) return 'offline'

  const meta = getSyncMeta()
  const updatedAt = new Date().toISOString()
  setSyncMeta({ updatedAt })

  const result = await pushRemoteState(slice, updatedAt, meta.clientId)

  if (result.ok) {
    setSyncMeta({ lastSyncedAt: new Date().toISOString(), updatedAt })
    lastConflict = null
    return 'synced'
  }

  if (result.conflict) {
    lastConflict = result.conflict
    return 'conflict'
  }

  return 'error'
}

export async function forcePushOverwrite(
  slice: PersistedRestaurantState,
): Promise<SyncStatus> {
  if (!SYNC_ENABLED) return 'disabled'

  if (!(await isServerReachable())) return 'offline'

  const meta = getSyncMeta()
  const updatedAt = winningTimestamp(lastConflict?.updatedAt)
  setSyncMeta({ updatedAt })

  const result = await pushRemoteState(slice, updatedAt, meta.clientId)

  if (result.ok) {
    setSyncMeta({ lastSyncedAt: new Date().toISOString(), updatedAt })
    lastConflict = null
    return 'synced'
  }

  if (result.conflict) {
    lastConflict = result.conflict
    return 'conflict'
  }

  return 'error'
}

export function schedulePush(
  slice: PersistedRestaurantState,
  onPush: (state: PersistedRestaurantState) => Promise<SyncStatus>,
): void {
  if (!SYNC_ENABLED) return

  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    void onPush(slice)
  }, PUSH_DEBOUNCE_MS)
}

export async function forcePushState(slice: PersistedRestaurantState): Promise<SyncStatus> {
  if (pushTimer) {
    clearTimeout(pushTimer)
    pushTimer = null
  }
  return pushState(slice)
}