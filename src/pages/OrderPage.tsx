import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CurrentDraftPanel } from '../components/order/CurrentDraftPanel'
import { OrderTableHeader } from '../components/order/OrderTableHeader'
import { OrderView } from '../components/order/OrderView'
import { useRestaurantStore } from '../store/useRestaurantStore'
import { paths } from '../routes/paths'

export function OrderPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const tables = useRestaurantStore((s) => s.tables)
  const ensureTableOpen = useRestaurantStore((s) => s.ensureTableOpen)
  const setActiveTable = useRestaurantStore((s) => s.setActiveTable)
  const setSearchQuery = useRestaurantStore((s) => s.setSearchQuery)
  const setActiveCategory = useRestaurantStore((s) => s.setActiveCategory)

  const table = tables.find((t) => t.id === tableId)

  useEffect(() => {
    if (!tableId || !table) return

    ensureTableOpen(tableId)
    setActiveTable(tableId)
    setSearchQuery('')
    setActiveCategory('bebidas')

    return () => {
      setActiveTable(null)
    }
  }, [tableId, table, ensureTableOpen, setActiveTable, setSearchQuery, setActiveCategory])

  if (!tableId || !table) {
    return <Navigate to={paths.tables} replace />
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden">
      <OrderTableHeader table={table} />
      <CurrentDraftPanel tableId={table.id} />
      <OrderView table={table} />
    </div>
  )
}