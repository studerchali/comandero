import type { PersistedRestaurantState } from '../types/restaurant'

export interface RestaurantRepository {
  load(): PersistedRestaurantState | null
  save(state: PersistedRestaurantState): void
  clear(): void
}