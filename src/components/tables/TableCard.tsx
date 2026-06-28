import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../../i18n/messages'
import { paths } from '../../routes/paths'
import type { Table } from '../../types/restaurant'
import { useRestaurantStore } from '../../store/useRestaurantStore'
import { Badge } from '../../ui/Badge'
import { formatCurrency } from '../../utils/format'
import { calculateOrderTotals } from '../../utils/pricing'

interface TableCardProps {
  table: Table
}

export const TableCard = memo(function TableCard({ table }: TableCardProps) {
  const navigate = useNavigate()
  const ensureTableOpen = useRestaurantStore((s) => s.ensureTableOpen)
  const order = useRestaurantStore((s) => s.orders[table.id])

  const totals = order ? calculateOrderTotals(order.items) : null
  const draftCount = order?.items.filter((i) => !i.sentAt).length ?? 0

  const borderColor =
    table.status === 'libre'
      ? 'border-cmd-border'
      : table.status === 'ocupada'
        ? 'border-cmd-warning/50'
        : table.status === 'enviada'
          ? 'border-cmd-accent/50'
          : 'border-cmd-success/50'

  const handleOpen = () => {
    ensureTableOpen(table.id)
    void navigate(paths.table(table.id))
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={handleOpen}
      className={`flex min-h-[120px] flex-col items-start justify-between rounded-2xl border-2 bg-cmd-surface p-4 text-left transition-colors hover:bg-cmd-surface-2 ${borderColor}`}
      aria-label={`${table.label}, ${table.status}`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div>
          <p className="text-xl font-bold text-cmd-text">{table.label}</p>
          <p className="text-xs text-cmd-muted">{table.zone}</p>
        </div>
        <Badge variant={table.status} size="sm" />
      </div>

      <div className="flex w-full items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-cmd-muted">
          <Users className="h-4 w-4" aria-hidden />
          {table.seats}
        </span>
        {totals && totals.itemCount > 0 ? (
          <span className="font-semibold text-cmd-accent">
            {formatCurrency(totals.total)}
            {draftCount > 0 && (
              <span className="ml-1 text-cmd-warning">(+{draftCount})</span>
            )}
          </span>
        ) : (
          <span className="text-cmd-muted">{t.tables.tapToOpen}</span>
        )}
      </div>
    </motion.button>
  )
})