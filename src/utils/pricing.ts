import type { OrderLineItem, OrderTotals, VatRate } from '../types/restaurant'

export function lineGrossTotal(item: OrderLineItem): number {
  return item.price * item.quantity
}

export function lineNetAmount(gross: number, vatRate: VatRate): number {
  return gross / (1 + vatRate / 100)
}

export function lineVatAmount(gross: number, vatRate: VatRate): number {
  return gross - lineNetAmount(gross, vatRate)
}

export function calculateOrderTotals(items: OrderLineItem[]): OrderTotals {
  let subtotal = 0
  let vat10 = 0
  let vat21 = 0
  let itemCount = 0

  for (const item of items) {
    const gross = lineGrossTotal(item)
    const vat = lineVatAmount(gross, item.vatRate)
    const net = gross - vat

    subtotal += net
    itemCount += item.quantity

    if (item.vatRate === 10) {
      vat10 += vat
    } else {
      vat21 += vat
    }
  }

  const totalVat = vat10 + vat21
  const total = subtotal + totalVat

  return {
    subtotal: roundMoney(subtotal),
    vat10: roundMoney(vat10),
    vat21: roundMoney(vat21),
    totalVat: roundMoney(totalVat),
    total: roundMoney(total),
    itemCount,
  }
}

export function calculateDraftTotals(items: OrderLineItem[]): OrderTotals {
  return calculateOrderTotals(items.filter((item) => !item.sentAt))
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}