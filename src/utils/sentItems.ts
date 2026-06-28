import type { OrderLineItem } from '../types/restaurant'

/** Agrupa ítems enviados por lote (mismo sentAt) y ordena lotes: más reciente arriba. */
export function groupSentItemsByBatch(items: OrderLineItem[]): OrderLineItem[][] {
  const batches = new Map<string, OrderLineItem[]>()

  for (const item of items) {
    if (!item.sentAt) continue
    const batch = batches.get(item.sentAt) ?? []
    batch.push(item)
    batches.set(item.sentAt, batch)
  }

  return [...batches.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, batchItems]) => batchItems)
}