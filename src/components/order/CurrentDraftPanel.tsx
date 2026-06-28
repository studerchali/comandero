import { ClipboardList } from 'lucide-react'
import { useMemo } from 'react'
import { t } from '../../i18n/messages'
import { useRestaurantStore } from '../../store/useRestaurantStore'
import { formatCurrency } from '../../utils/format'
import { calculateDraftTotals } from '../../utils/pricing'
import { OrderLineItemRow } from './OrderLineItem'

interface CurrentDraftPanelProps {
  tableId: string
  className?: string
}

export function CurrentDraftPanel({ tableId, className = '' }: CurrentDraftPanelProps) {
  const order = useRestaurantStore((s) => s.orders[tableId])
  const updateItemQuantity = useRestaurantStore((s) => s.updateItemQuantity)
  const removeItem = useRestaurantStore((s) => s.removeItem)

  const draftItems = useMemo(
    () => order?.items.filter((item) => !item.sentAt) ?? [],
    [order?.items],
  )
  const draftTotals = useMemo(() => calculateDraftTotals(draftItems), [draftItems])

  return (
    <section
      className={`shrink-0 border-b-2 border-cmd-accent/40 bg-cmd-surface-2 ring-1 ring-cmd-accent/20 ${className}`}
      aria-label={t.order.current}
      data-testid="current-draft-panel"
    >
      <div className="border-b border-cmd-border/60 px-4 py-3">
        <div className="flex items-start gap-2">
          <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-cmd-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-cmd-text">{t.order.current}</h2>
            <p className="text-xs text-cmd-muted">{t.order.currentHint}</p>
          </div>
          {draftTotals.itemCount > 0 && (
            <span className="shrink-0 rounded-full bg-cmd-warning/15 px-2.5 py-1 text-xs font-semibold text-cmd-warning">
              {draftTotals.itemCount}
            </span>
          )}
        </div>
      </div>

      {draftItems.length === 0 ? (
        <p className="min-h-[4rem] px-4 py-3 text-center text-sm leading-relaxed text-cmd-muted">
          {t.order.noDraft}
        </p>
      ) : (
        <>
          <ul className="max-h-48 space-y-2 overflow-y-auto px-3 py-3">
            {draftItems.map((item) => (
              <OrderLineItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateItemQuantity}
                onRemove={removeItem}
              />
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-cmd-border/60 px-4 py-2.5 text-sm">
            <span className="text-cmd-muted">{t.order.pendingSend}</span>
            <span className="font-semibold text-cmd-warning">
              {formatCurrency(draftTotals.total)}
            </span>
          </div>
        </>
      )}
    </section>
  )
}