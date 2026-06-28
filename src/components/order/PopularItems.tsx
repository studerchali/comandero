import { Flame } from 'lucide-react'
import { memo } from 'react'
import { POPULAR_ITEMS } from '../../data/menu'
import { t } from '../../i18n/messages'
import { useRestaurantStore } from '../../store/useRestaurantStore'
import { formatCurrency } from '../../utils/format'

export const PopularItems = memo(function PopularItems() {
  const openAddItem = useRestaurantStore((s) => s.openAddItem)
  const searchQuery = useRestaurantStore((s) => s.searchQuery)

  if (searchQuery.trim()) return null

  return (
    <section aria-label="Artículos populares">
      <div className="mb-2 flex items-center gap-2">
        <Flame className="h-4 w-4 text-cmd-warning" aria-hidden />
        <h3 className="text-sm font-semibold text-cmd-muted">{t.order.popular}</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {POPULAR_ITEMS.slice(0, 8).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openAddItem(item.id)}
            className="flex min-w-[140px] shrink-0 flex-col rounded-xl border border-cmd-border bg-cmd-surface-2 px-3 py-3 text-left transition-all active:scale-95 hover:border-cmd-accent/40"
          >
            <span className="line-clamp-2 text-sm font-semibold text-cmd-text">
              {item.name}
            </span>
            <span className="mt-1 text-sm font-bold text-cmd-accent">
              {formatCurrency(item.price)}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
})