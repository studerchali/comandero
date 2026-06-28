export type VatRate = 10 | 21

export type TableStatus = 'libre' | 'ocupada' | 'enviada' | 'cuenta'

export type OrderStatus = 'abierta' | 'enviada' | 'cuenta'

export interface MenuCategory {
  id: string
  name: string
  icon: string
  sortOrder: number
}

export interface MenuItem {
  id: string
  name: string
  categoryId: string
  price: number
  vatRate: VatRate
  allergens: string[]
  popular: boolean
  quickNotes: string[]
  description?: string
}

export interface Table {
  id: string
  number: number
  label: string
  zone: string
  seats: number
  status: TableStatus
}

export interface OrderLineItem {
  id: string
  menuItemId: string
  name: string
  price: number
  vatRate: VatRate
  quantity: number
  notes: string
  sentAt: string | null
}

export interface Order {
  tableId: string
  items: OrderLineItem[]
  status: OrderStatus
  createdAt: string
  updatedAt: string
  lastSentAt: string | null
}

export interface KitchenTicket {
  id: string
  tableId: string
  tableLabel: string
  items: OrderLineItem[]
  sentAt: string
  round: number
}

export interface OrderTotals {
  subtotal: number
  vat10: number
  vat21: number
  totalVat: number
  total: number
  itemCount: number
}

export interface PersistedRestaurantState {
  tables: Table[]
  orders: Record<string, Order>
  kitchenTickets: KitchenTicket[]
}