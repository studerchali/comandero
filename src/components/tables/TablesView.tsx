import { useMemo } from 'react'
import { t } from '../../i18n/messages'
import { useRestaurantStore } from '../../store/useRestaurantStore'
import { TableCard } from './TableCard'

export function TablesView() {
  const tables = useRestaurantStore((s) => s.tables)

  const grouped = useMemo(() => {
    const map = new Map<string, typeof tables>()
    for (const table of tables) {
      const list = map.get(table.zone) ?? []
      list.push(table)
      map.set(table.zone, list)
    }
    return map
  }, [tables])

  const stats = useMemo(() => {
    const counts = { libre: 0, ocupada: 0, enviada: 0, cuenta: 0 }
    for (const table of tables) counts[table.status]++
    return counts
  }, [tables])

  return (
    <div className="px-4 pb-28 pt-2">
      <div className="mb-4 flex flex-wrap gap-2">
        <StatPill label={t.tables.stats.free} value={stats.libre} color="muted" />
        <StatPill label={t.tables.stats.occupied} value={stats.ocupada} color="warning" />
        <StatPill label={t.tables.stats.sent} value={stats.enviada} color="accent" />
        <StatPill label={t.tables.stats.bill} value={stats.cuenta} color="success" />
      </div>

      {[...grouped.entries()].map(([zone, zoneTables]) => (
        <section key={zone} className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cmd-muted">
            {zone}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {zoneTables.map((table) => (
              <TableCard key={table.id} table={table} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'muted' | 'warning' | 'accent' | 'success'
}) {
  const colors = {
    muted: 'bg-cmd-surface-2 text-cmd-muted',
    warning: 'bg-cmd-warning/10 text-cmd-warning',
    accent: 'bg-cmd-accent/10 text-cmd-accent',
    success: 'bg-cmd-success/10 text-cmd-success',
  }

  return (
    <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${colors[color]}`}>
      {label}: <strong>{value}</strong>
    </span>
  )
}