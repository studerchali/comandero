import { API_KEY, API_URL } from '../constants/app'
import type { PersistedRestaurantState } from '../types/restaurant'

export interface SyncRecord {
  state: PersistedRestaurantState
  updatedAt: string
  clientId: string
}

export interface PushResult {
  ok: boolean
  conflict?: SyncRecord
  error?: string
}

function headers(): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' }
  if (API_KEY) h['X-API-Key'] = API_KEY
  return h
}

function apiPath(path: string): string {
  const base = API_URL.replace(/\/$/, '')
  return base ? `${base}${path}` : path
}

export async function fetchHealth(): Promise<boolean> {
  try {
    const res = await fetch(apiPath('/api/health'))
    return res.ok
  } catch {
    return false
  }
}

export async function fetchRemoteState(): Promise<SyncRecord | null> {
  const res = await fetch(apiPath('/api/restaurant/state'), { headers: headers() })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Error al leer servidor (${res.status})`)
  return (await res.json()) as SyncRecord
}

export async function pushRemoteState(
  state: PersistedRestaurantState,
  updatedAt: string,
  clientId: string,
): Promise<PushResult> {
  try {
    const res = await fetch(apiPath('/api/restaurant/state'), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ state, updatedAt, clientId }),
    })

    if (res.status === 409) {
      const body = (await res.json()) as { server?: SyncRecord }
      return { ok: false, conflict: body.server }
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      return { ok: false, error: body.error ?? `Error ${res.status}` }
    }

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Error de red',
    }
  }
}

export async function clearRemoteState(): Promise<void> {
  await fetch(apiPath('/api/restaurant/state'), {
    method: 'DELETE',
    headers: headers(),
  })
}