import { describe, expect, it } from 'vitest'
import type { OrderLineItem } from '../types/restaurant'
import { groupSentItemsByBatch } from './sentItems'

function makeLine(overrides: Partial<OrderLineItem> = {}): OrderLineItem {
  return {
    id: 'line-1',
    menuItemId: 'menu-1',
    name: 'Café',
    price: 2,
    vatRate: 10,
    quantity: 1,
    notes: '',
    sentAt: null,
    ...overrides,
  }
}

describe('groupSentItemsByBatch', () => {
  it('ignora ítems sin enviar', () => {
    const items = [makeLine({ sentAt: null }), makeLine({ id: 'line-2', sentAt: '2026-06-01T12:00:00.000Z' })]
    expect(groupSentItemsByBatch(items)).toHaveLength(1)
  })

  it('ordena lotes descendente (más reciente primero)', () => {
    const items = [
      makeLine({ id: 'old', sentAt: '2026-06-01T10:00:00.000Z' }),
      makeLine({ id: 'new-a', sentAt: '2026-06-01T12:00:00.000Z' }),
      makeLine({ id: 'new-b', sentAt: '2026-06-01T12:00:00.000Z' }),
    ]

    const batches = groupSentItemsByBatch(items)

    expect(batches).toHaveLength(2)
    expect(batches[0].map((i) => i.id)).toEqual(['new-a', 'new-b'])
    expect(batches[1].map((i) => i.id)).toEqual(['old'])
  })
})