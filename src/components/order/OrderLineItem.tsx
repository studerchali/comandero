import { Minus, Plus, Trash2 } from 'lucide-react'
import { memo } from 'react'
import { t } from '../../i18n/messages'
import type { OrderLineItem as LineItem } from '../../types/restaurant'
import { formatCurrency } from '../../utils/format'
import { lineGrossTotal } from '../../utils/pricing'

interface OrderLineItemProps {
  item: LineItem
  onUpdateQuantity: (lineId: string, quantity: number) => void
  onRemove: (lineId: string) => void
}

export const OrderLineItemRow = memo(function OrderLineItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: OrderLineItemProps) {
  const isSent = Boolean(item.sentAt)
  const lineTotal = lineGrossTotal(item)

  return (
    <li
      className={`rounded-xl border px-3 py-2.5 ${
        isSent
          ? 'border-cmd-border/50 bg-cmd-surface/50 opacity-70'
          : 'border-cmd-border bg-cmd-surface-2'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-cmd-text">
            {item.quantity}× {item.name}
            {isSent && (
              <span className="ml-2 text-xs font-normal text-cmd-accent">✓ {t.order.sent}</span>
            )}
          </p>
          {item.notes && (
            <p className="mt-0.5 text-xs text-cmd-warning">
              {t.order.notePrefix}: {item.notes}
            </p>
          )}
        </div>
        <span className="shrink-0 font-semibold text-cmd-text">
          {formatCurrency(lineTotal)}
        </span>
      </div>

      {!isSent && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Reducir"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-cmd-surface-3 text-cmd-text disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[2rem] text-center font-bold">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label="Aumentar"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-cmd-surface-3 text-cmd-text"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label="Eliminar línea"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-cmd-danger hover:bg-cmd-danger/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </li>
  )
})