import type { PersistedRestaurantState } from '../types/restaurant'
import { clearRemoteState, fetchRemoteState } from '../services/apiClient'
import { forcePushState, getSyncMeta, setSyncMeta } from '../services/syncManager'
import type { RestaurantRepository } from './types'

export class ApiRepository implements RestaurantRepository {
  load(): PersistedRestaurantState | null {
    return null
  }

  save(state: PersistedRestaurantState): void {
    void forcePushState(state)
  }

  clear(): void {
    void clearRemoteState()
    setSyncMeta({ updatedAt: new Date(0).toISOString(), lastSyncedAt: null })
  }

  async loadAsync(): Promise<PersistedRestaurantState | null> {
    const record = await fetchRemoteState()
    if (!record) return null
    setSyncMeta({
      updatedAt: record.updatedAt,
      clientId: record.clientId,
      lastSyncedAt: new Date().toISOString(),
    })
    return record.state
  }

  get lastSync(): string | null {
    return getSyncMeta().lastSyncedAt
  }
}