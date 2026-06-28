import { describe, expect, it } from 'vitest'
import type { OrderLineItem } from '../types/restaurant'
import {
  calculateDraftTotals,
  calculateOrderTotals,
  lineGrossTotal,
  lineVatAmount,
} from './pricing'

function makeLine(overrides: Partial<OrderLineItem> = {}): OrderLineItem {
  return {
    id: 'line-1',
    menuItemId: 'item-1',
    name: 'Patatas bravas',
    price: 6.5,
    vatRate: 10,
    quantity: 2,
    notes: '',
    sentAt: null,
    ...overrides,
  }
}

describe('pricing', () => {
  it('calculates line gross total', () => {
    expect(lineGrossTotal(makeLine({ price: 3, quantity: 2 }))).toBe(6)
  })

  it('calculates VAT at 10%', () => {
    const gross = 11
    expect(lineVatAmount(gross, 10)).toBeCloseTo(1, 1)
  })

  it('calculates order totals with mixed items', () => {
    const items = [
      makeLine({ price: 10, quantity: 1, vatRate: 10 }),
      makeLine({ id: 'line-2', price: 5, quantity: 2, vatRate: 21 }),
    ]
    const totals = calculateOrderTotals(items)

    expect(totals.itemCount).toBe(3)
    expect(totals.total).toBe(20)
    expect(totals.totalVat).toBeGreaterThan(0)
  })

  it('calculates only draft items for send preview', () => {
    const items = [
      makeLine({ sentAt: '2026-06-01T10:00:00.000Z' }),
      makeLine({ id: 'line-2', price: 4, quantity: 1, sentAt: null }),
    ]
    const draft = calculateDraftTotals(items)

    expect(draft.itemCount).toBe(1)
    expect(draft.total).toBe(4)
  })
})