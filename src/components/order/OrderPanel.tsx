import { ChefHat, Receipt } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../../i18n/messages'
import { paths } from '../../routes/paths'
import { useRestaurantStore } from '../../store/useRestaurantStore'
import { Button } from '../../ui/Button'
import { formatCurrency } from '../../utils/format'
import { calculateDraftTotals, calculateOrderTotals } from '../../utils/pricing'
import { OrderLineItemRow } from './OrderLineItem'

interface OrderPanelProps {
  tableId: string
  tableLabel: string
  compact?: boolean
}

export function OrderPanel({ tableId, tableLabel, compact = false }: OrderPanelProps) {
  const navigate = useNavigate()
  const order = useRestaurantStore((s) => s.orders[tableId])
  const updateItemQuantity = useRestaurantStore((s) => s.updateItemQuantity)
  const removeItem = useRestaurantStore((s) => s.removeItem)
  const sendToKitchen = useRestaurantStore((s) => s.sendToKitchen)
  const markReadyForBill = useRestaurantStore((s) => s.markReadyForBill)
  const closeTable = useRestaurantStore((s) => s.closeTable)

  const draftTotals = useMemo(
    () => calculateDraftTotals(order?.items ?? []),
    [order?.items],
  )
  const fullTotals = useMemo(
    () => calculateOrderTotals(order?.items ?? []),
    [order?.items],
  )

  const draftItems = order?.items.filter((i) => !i.sentAt) ?? []
  const sentItems = order?.items.filter((i) => i.sentAt) ?? []
  const canSend = draftItems.length > 0
  const hasOrder = (order?.items.length ?? 0) > 0

  return (
    <div
      className={`flex flex-col bg-cmd-surface ${compact ? 'max-h-[36vh]' : 'h-full min-h-0'}`}
    >
      <div className="shrink-0 border-b border-cmd-border px-4 py-3">
        <h2 className="text-lg font-bold text-cmd-text">{t.order.tableSummary}</h2>
        <p className="text-sm text-cmd-muted">{tableLabel}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {!hasOrder && (
          <p className="py-6 text-center text-sm text-cmd-muted">{t.order.empty}</p>
        )}

        {sentItems.length > 0 && (
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-cmd-muted">
              {t.order.alreadySent}
            </p>
            <ul className="space-y-2">
              {sentItems.map((item) => (
                <OrderLineItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateItemQuantity}
                  onRemove={removeItem}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-cmd-border bg-cmd-surface-2 px-4 py-4">
        {draftTotals.itemCount > 0 && (
          <div className="mb-2 flex justify-between text-sm text-cmd-muted">
            <span>
              {t.order.pendingSend} ({draftTotals.itemCount})
            </span>
            <span className="font-semibold text-cmd-warning">
              {formatCurrency(draftTotals.total)}
            </span>
          </div>
        )}

        <div className="mb-1 flex justify-between text-sm text-cmd-muted">
          <span>{t.order.subtotal}</span>
          <span>{formatCurrency(fullTotals.subtotal)}</span>
        </div>
        {fullTotals.vat10 > 0 && (
          <div className="flex justify-between text-xs text-cmd-muted">
            <span>{t.order.vat10}</span>
            <span>{formatCurrency(fullTotals.vat10)}</span>
          </div>
        )}
        {fullTotals.vat21 > 0 && (
          <div className="flex justify-between text-xs text-cmd-muted">
            <span>{t.order.vat21}</span>
            <span>{formatCurrency(fullTotals.vat21)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between text-lg font-bold text-cmd-text">
          <span>{t.order.total}</span>
          <span className="text-cmd-accent">{formatCurrency(fullTotals.total)}</span>
        </div>

        <div className="mt-4 space-y-2">
          <Button fullWidth size="xl" onClick={() => sendToKitchen()} disabled={!canSend}>
            <ChefHat className="h-6 w-6" />
            {t.order.sendToKitchen}
          </Button>

          {order && order.items.some((i) => i.sentAt) && (
            <Button
              fullWidth
              variant="success"
              size="md"
              onClick={() => markReadyForBill(tableId)}
            >
              <Receipt className="h-5 w-5" />
              {t.order.requestBill}
            </Button>
          )}

          {order?.status === 'cuenta' && (
            <Button
              fullWidth
              variant="secondary"
              size="md"
              onClick={() => {
                if (confirm(t.order.closeTableConfirm)) {
                  closeTable(tableId)
                  void navigate(paths.tables)
                }
              }}
            >
              {t.order.closeTable}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}