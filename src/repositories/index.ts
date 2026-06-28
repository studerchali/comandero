import { REPOSITORY_MODE } from '../constants/app'
import { ApiRepository } from './ApiRepository'
import { LocalStorageRepository } from './LocalStorageRepository'
import type { RestaurantRepository } from './types'
import type { PersistedRestaurantState } from '../types/restaurant'

let instance: RestaurantRepository | null = null

export function getRestaurantRepository(): RestaurantRepository {
  if (!instance) {
    instance = REPOSITORY_MODE === 'api' ? new ApiRepository() : new LocalStorageRepository()
  }
  return instance
}

export function createRepositoryStorage() {
  const repo = getRestaurantRepository()
  const isLocal = repo instanceof LocalStorageRepository

  return {
    getItem: (name: string): string | null => {
      if (isLocal) {
        return localStorage.getItem(name)
      }
      const data = repo.load()
      if (!data) return null
      return JSON.stringify({ state: data, version: 1 })
    },
    setItem: (name: string, value: string): void => {
      if (isLocal) {
        localStorage.setItem(name, value)
        return
      }
      const parsed = JSON.parse(value) as { state: PersistedRestaurantState }
      repo.save(parsed.state)
    },
    removeItem: (name: string): void => {
      if (isLocal) {
        localStorage.removeItem(name)
      } else {
        repo.clear()
      }
    },
  }
}

export type { RestaurantRepository } from './types'
export { LocalStorageRepository } from './LocalStorageRepository'
export { ApiRepository } from './ApiRepository'