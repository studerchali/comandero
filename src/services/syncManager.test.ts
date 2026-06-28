import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SYNC_META_KEY } from '../constants/storage'
import type { PersistedRestaurantState } from '../types/restaurant'

const emptyState: PersistedRestaurantState = {
  tables: [],
  orders: {},
  kitchenTickets: [],
}

function mockFetch(handlers: Record<string, () => Response | Promise<Response>>) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url
      const handler = handlers[url]
      if (!handler) return Promise.resolve(new Response('Not found', { status: 404 }))
      return Promise.resolve(handler())
    }),
  )
}

describe('syncManager', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubEnv('VITE_SYNC_ENABLED', 'true')
    vi.stubEnv('VITE_API_URL', '')
    vi.stubGlobal('navigator', { onLine: true })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('pullState applies remote when server is newer', async () => {
    const remoteUpdatedAt = '2026-06-27T12:00:00.000Z'
    localStorage.setItem(
      SYNC_META_KEY,
      JSON.stringify({
        clientId: 'client-a',
        updatedAt: '2026-06-27T11:00:00.000Z',
        lastSyncedAt: null,
      }),
    )

    mockFetch({
      '/api/health': () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      '/api/restaurant/state': () =>
        new Response(
          JSON.stringify({
            state: emptyState,
            updatedAt: remoteUpdatedAt,
            clientId: 'client-b',
          }),
          { status: 200 },
        ),
    })

    const { pullState } = await import('./syncManager')
    const result = await pullState()

    expect(result.applied).toBe(true)
    expect(result.status).toBe('synced')
    expect(result.record?.updatedAt).toBe(remoteUpdatedAt)
  })

  it('pushState returns conflict when server rejects with 409', async () => {
    mockFetch({
      '/api/health': () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      '/api/restaurant/state': () =>
        new Response(
          JSON.stringify({
            server: {
              state: emptyState,
              updatedAt: '2026-06-27T13:00:00.000Z',
              clientId: 'client-b',
            },
          }),
          { status: 409 },
        ),
    })

    const { pushState } = await import('./syncManager')
    const status = await pushState(emptyState)

    expect(status).toBe('conflict')
  })

  it('returns offline when navigator is offline', async () => {
    vi.stubGlobal('navigator', { onLine: false })

    const { pullState } = await import('./syncManager')
    const result = await pullState()

    expect(result.status).toBe('offline')
    expect(result.applied).toBe(false)
  })
})