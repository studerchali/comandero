import { INITIAL_TABLES } from '../data/tables'
import { STORAGE_KEY, STORAGE_SCHEMA_VERSION } from '../constants/storage'
import type { PersistedRestaurantState } from '../types/restaurant'
import type { RestaurantRepository } from './types'

interface StoredPayload {
  state: PersistedRestaurantState
  version: number
}

function normalizeState(raw: unknown): PersistedRestaurantState | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  if (obj.tables && obj.orders && obj.kitchenTickets) {
    return {
      tables: obj.tables as PersistedRestaurantState['tables'],
      orders: obj.orders as PersistedRestaurantState['orders'],
      kitchenTickets: obj.kitchenTickets as PersistedRestaurantState['kitchenTickets'],
    }
  }

  return null
}

export class LocalStorageRepository implements RestaurantRepository {
  load(): PersistedRestaurantState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null

      const parsed = JSON.parse(raw) as StoredPayload | PersistedRestaurantState

      if ('state' in parsed && parsed.state) {
        return normalizeState(parsed.state)
      }

      return normalizeState(parsed)
    } catch {
      return null
    }
  }

  save(state: PersistedRestaurantState): void {
    const payload: StoredPayload = {
      state,
      version: STORAGE_SCHEMA_VERSION,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  getDefaultState(): PersistedRestaurantState {
    return {
      tables: INITIAL_TABLES,
      orders: {},
      kitchenTickets: [],
    }
  }
}