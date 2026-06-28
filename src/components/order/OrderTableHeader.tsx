import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { t } from '../../i18n/messages'
import { paths } from '../../routes/paths'
import type { Table } from '../../types/restaurant'

interface OrderTableHeaderProps {
  table: Table
}

export function OrderTableHeader({ table }: OrderTableHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center gap-3 border-b border-cmd-border bg-cmd-bg px-4 py-3">
      <button
        type="button"
        onClick={() => void navigate(paths.tables)}
        aria-label={t.order.backToTables}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cmd-surface-2 text-cmd-text transition-all active:scale-95"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <div>
        <h1 className="text-xl font-bold text-cmd-text">{table.label}</h1>
        <p className="text-sm text-cmd-muted">
          {table.zone} · {table.seats} {t.order.diners}
        </p>
      </div>
    </header>
  )
}