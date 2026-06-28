import { z } from 'zod'

const tableStatus = z.enum(['libre', 'ocupada', 'enviada', 'cuenta'])
const orderStatus = z.enum(['abierta', 'enviada', 'cuenta'])
const vatRate = z.union([z.literal(10), z.literal(21)])

const orderLineItemSchema = z.object({
  id: z.string().min(1).max(64),
  menuItemId: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  price: z.number().nonnegative(),
  vatRate,
  quantity: z.number().int().positive().max(99),
  notes: z.string().max(500),
  sentAt: z.string().nullable(),
})

const orderSchema = z.object({
  tableId: z.string().min(1).max(64),
  items: z.array(orderLineItemSchema).max(500),
  status: orderStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
  lastSentAt: z.string().nullable(),
})

const tableSchema = z.object({
  id: z.string().min(1).max(64),
  number: z.number().int().positive(),
  label: z.string().min(1).max(50),
  zone: z.string().min(1).max(50),
  seats: z.number().int().positive().max(20),
  status: tableStatus,
})

const kitchenTicketSchema = z.object({
  id: z.string().min(1).max(64),
  tableId: z.string().min(1).max(64),
  tableLabel: z.string().min(1).max(50),
  items: z.array(orderLineItemSchema).max(200),
  sentAt: z.string(),
  round: z.number().int().positive(),
})

export const persistedStateSchema = z.object({
  tables: z.array(tableSchema).max(100),
  orders: z.record(z.string(), orderSchema),
  kitchenTickets: z.array(kitchenTicketSchema).max(500),
})

export const syncPayloadSchema = z.object({
  state: persistedStateSchema,
  updatedAt: z.string(),
  clientId: z.string().min(1).max(64),
})

export type PersistedState = z.infer<typeof persistedStateSchema>
export type SyncPayload = z.infer<typeof syncPayloadSchema>