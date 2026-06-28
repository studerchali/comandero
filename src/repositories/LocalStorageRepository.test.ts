import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../constants/storage'
import { LocalStorageRepository } from './LocalStorageRepository'

describe('LocalStorageRepository', () => {
  const repo = new LocalStorageRepository()

  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when storage is empty', () => {
    expect(repo.load()).toBeNull()
  })

  it('saves and loads persisted state', () => {
    const state = repo.getDefaultState()
    state.tables[0] = { ...state.tables[0], status: 'ocupada' }

    repo.save(state)
    const loaded = repo.load()

    expect(loaded?.tables[0].status).toBe('ocupada')
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()
  })

  it('clears storage', () => {
    repo.save(repo.getDefaultState())
    repo.clear()
    expect(repo.load()).toBeNull()
  })
})