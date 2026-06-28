import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { INITIAL_TABLES } from '../data/tables'
import { MENU_BY_ID } from '../data/menu'
import { STORAGE_KEY } from '../constants/storage'
import { createRepositoryStorage } from '../repositories'
import {
  applyRemoteState,
  clearConflict,
  forcePushOverwrite,
  forcePushState,
  getLastConflict,
  pullState,
  type SyncStatus,
} from '../services/syncManager'
import type {
  KitchenTicket,
  MenuItem,
  Order,
  OrderLineItem,
  Table,
  TableStatus,
} from '../types/restaurant'

interface RestaurantStore {
  tables: Table[]
  orders: Record<string, Order>
  kitchenTickets: KitchenTicket[]

  activeTableId: string | null
  activeCategoryId: string
  searchQuery: string
  pendingMenuItemId: string | null
  showSendConfirmation: boolean
  lastTicketId: string | null

  syncStatus: SyncStatus
  setSyncStatus: (status: SyncStatus) => void
  syncNow: () => Promise<void>
  acceptRemoteState: () => void
  forceLocalSync: () => Promise<void>

  setActiveTable: (tableId: string | null) => void
  setActiveCategory: (categoryId: string) => void
  setSearchQuery: (query: string) => void
  ensureTableOpen: (tableId: string) => void
  openAddItem: (menuItemId: string) => void
  closeAddItem: () => void
  addItemToOrder: (menuItemId: string, quantity: number, notes: string) => void
  updateItemQuantity: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
  sendToKitchen: () => string | null
  dismissSendConfirmation: () => void
  markReadyForBill: (tableId: string) => void
  closeTable: (tableId: string) => void
  resetAllData: () => void
  getOrder: (tableId: string) => Order | undefined
  getDraftItems: (tableId: string) => OrderLineItem[]
}

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function syncTableStatus(tables: Table[], tableId: string, status: TableStatus): Table[] {
  return tables.map((table) => (table.id === tableId ? { ...table, status } : table))
}

function createEmptyOrder(tableId: string): Order {
  const now = new Date().toISOString()
  return {
    tableId,
    items: [],
    status: 'abierta',
    createdAt: now,
    updatedAt: now,
    lastSentAt: null,
  }
}

function deriveTableStatus(order: Order | undefined): TableStatus {
  if (!order || order.items.length === 0) return 'ocupada'
  const hasDraft = order.items.some((item) => !item.sentAt)
  if (order.status === 'cuenta') return 'cuenta'
  if (hasDraft) return 'ocupada'
  return 'enviada'
}

function getPersistedSlice(state: RestaurantStore) {
  return {
    tables: state.tables,
    orders: state.orders,
    kitchenTickets: state.kitchenTickets,
  }
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set, get) => ({
      tables: INITIAL_TABLES,
      orders: {},
      kitchenTickets: [],

      activeTableId: null,
      activeCategoryId: 'bebidas',
      searchQuery: '',
      pendingMenuItemId: null,
      showSendConfirmation: false,
      lastTicketId: null,

      syncStatus: 'idle',
      setSyncStatus: (status) => set({ syncStatus: status }),

      syncNow: async () => {
        set({ syncStatus: 'syncing' })
        const pullResult = await pullState()
        if (pullResult.applied && pullResult.record) {
          const remote = applyRemoteState(pullResult.record)
          set({
            tables: remote.tables,
            orders: remote.orders,
            kitchenTickets: remote.kitchenTickets,
            syncStatus: 'synced',
          })
          return
        }

        const slice = getPersistedSlice(get())
        const status = await forcePushState(slice)
        set({ syncStatus: status })
      },

      acceptRemoteState: () => {
        const conflict = getLastConflict()
        if (!conflict) return
        const remote = applyRemoteState(conflict)
        clearConflict()
        set({
          tables: remote.tables,
          orders: remote.orders,
          kitchenTickets: remote.kitchenTickets,
          syncStatus: 'synced',
        })
      },

      forceLocalSync: async () => {
        set({ syncStatus: 'syncing' })
        const slice = getPersistedSlice(get())
        const status = await forcePushOverwrite(slice)
        set({ syncStatus: status })
      },

      setActiveTable: (tableId) => set({ activeTableId: tableId }),

      setActiveCategory: (categoryId) => set({ activeCategoryId: categoryId }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      ensureTableOpen: (tableId) => {
        const { orders, tables } = get()
        if (orders[tableId]) return

        const order = createEmptyOrder(tableId)
        set({
          orders: { ...orders, [tableId]: order },
          tables: syncTableStatus(tables, tableId, 'ocupada'),
        })
      },

      openAddItem: (menuItemId) => set({ pendingMenuItemId: menuItemId }),

      closeAddItem: () => set({ pendingMenuItemId: null }),

      addItemToOrder: (menuItemId, quantity, notes) => {
        const { activeTableId, orders } = get()
        if (!activeTableId) return

        const menuItem = MENU_BY_ID.get(menuItemId)
        if (!menuItem || quantity < 1) return

        const order = orders[activeTableId] ?? createEmptyOrder(activeTableId)
        const line: OrderLineItem = {
          id: generateId('line'),
          menuItemId,
          name: menuItem.name,
          price: menuItem.price,
          vatRate: menuItem.vatRate,
          quantity,
          notes: notes.trim(),
          sentAt: null,
        }

        const updated: Order = {
          ...order,
          items: [...order.items, line],
          updatedAt: new Date().toISOString(),
          status: order.status === 'cuenta' ? 'enviada' : order.status,
        }

        set((state) => ({
          orders: { ...state.orders, [activeTableId]: updated },
          tables: syncTableStatus(state.tables, activeTableId, deriveTableStatus(updated)),
          pendingMenuItemId: null,
        }))
      },

      updateItemQuantity: (lineId, quantity) => {
        const { activeTableId, orders } = get()
        if (!activeTableId || quantity < 1) return

        const order = orders[activeTableId]
        if (!order) return

        const updated: Order = {
          ...order,
          items: order.items.map((item) =>
            item.id === lineId && !item.sentAt ? { ...item, quantity } : item,
          ),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          orders: { ...state.orders, [activeTableId]: updated },
        }))
      },

      removeItem: (lineId) => {
        const { activeTableId, orders, tables } = get()
        if (!activeTableId) return

        const order = orders[activeTableId]
        if (!order) return

        const updated: Order = {
          ...order,
          items: order.items.filter((item) => item.id !== lineId || item.sentAt !== null),
          updatedAt: new Date().toISOString(),
        }

        const newStatus: TableStatus =
          updated.items.length === 0 ? 'ocupada' : deriveTableStatus(updated)

        set({
          orders: { ...orders, [activeTableId]: updated },
          tables: syncTableStatus(tables, activeTableId, newStatus),
        })
      },

      sendToKitchen: () => {
        const { activeTableId, orders, tables, kitchenTickets } = get()
        if (!activeTableId) return null

        const order = orders[activeTableId]
        if (!order) return null

        const draftItems = order.items.filter((item) => !item.sentAt)
        if (draftItems.length === 0) return null

        const now = new Date().toISOString()
        const table = tables.find((t) => t.id === activeTableId)
        const ticketId = generateId('ticket')
        const round =
          kitchenTickets.filter((t) => t.tableId === activeTableId).length + 1

        const sentItems = draftItems.map((item) => ({ ...item, sentAt: now }))
        const sentIds = new Set(sentItems.map((item) => item.id))

        const updatedItems = order.items.map((item) =>
          sentIds.has(item.id) ? { ...item, sentAt: now } : item,
        )

        const ticket: KitchenTicket = {
          id: ticketId,
          tableId: activeTableId,
          tableLabel: table?.label ?? activeTableId,
          items: sentItems,
          sentAt: now,
          round,
        }

        const updatedOrder: Order = {
          ...order,
          items: updatedItems,
          status: 'enviada',
          updatedAt: now,
          lastSentAt: now,
        }

        set({
          orders: { ...orders, [activeTableId]: updatedOrder },
          tables: syncTableStatus(tables, activeTableId, 'enviada'),
          kitchenTickets: [ticket, ...kitchenTickets],
          showSendConfirmation: true,
          lastTicketId: ticketId,
        })

        return ticketId
      },

      dismissSendConfirmation: () => set({ showSendConfirmation: false }),

      markReadyForBill: (tableId) => {
        const { orders, tables } = get()
        const order = orders[tableId]
        if (!order) return

        const updated: Order = { ...order, status: 'cuenta', updatedAt: new Date().toISOString() }

        set({
          orders: { ...orders, [tableId]: updated },
          tables: syncTableStatus(tables, tableId, 'cuenta'),
        })
      },

      closeTable: (tableId) => {
        const { orders, tables } = get()
        const { [tableId]: _removed, ...restOrders } = orders

        set({
          orders: restOrders,
          tables: syncTableStatus(tables, tableId, 'libre'),
          activeTableId: get().activeTableId === tableId ? null : get().activeTableId,
        })
      },

      resetAllData: () => {
        set({
          tables: INITIAL_TABLES.map((t) => ({ ...t, status: 'libre' as TableStatus })),
          orders: {},
          kitchenTickets: [],
          activeTableId: null,
          searchQuery: '',
          pendingMenuItemId: null,
          showSendConfirmation: false,
          lastTicketId: null,
        })
      },

      getOrder: (tableId) => get().orders[tableId],

      getDraftItems: (tableId) => {
        const order = get().orders[tableId]
        return order?.items.filter((item) => !item.sentAt) ?? []
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createRepositoryStorage()),
      partialize: (state) => ({
        tables: state.tables,
        orders: state.orders,
        kitchenTickets: state.kitchenTickets,
      }),
    },
  ),
)

export function getPendingMenuItem(): MenuItem | null {
  const id = useRestaurantStore.getState().pendingMenuItemId
  if (!id) return null
  return MENU_BY_ID.get(id) ?? null
}