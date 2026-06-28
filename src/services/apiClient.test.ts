import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', '')
    vi.stubEnv('VITE_API_KEY', 'test-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('fetchHealth returns true on ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))),
    )

    const { fetchHealth } = await import('./apiClient')
    expect(await fetchHealth()).toBe(true)
  })

  it('pushRemoteState sends API key header', async () => {
    const fetchMock = vi.fn<() => Promise<Response>>(() =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { pushRemoteState } = await import('./apiClient')
    await pushRemoteState({ tables: [], orders: {}, kitchenTickets: [] }, '2026-01-01T00:00:00.000Z', 'c1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/restaurant/state',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ 'X-API-Key': 'test-key' }),
      }),
    )
  })
})