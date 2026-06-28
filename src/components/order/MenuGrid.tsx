import { AlertTriangle } from 'lucide-react'
import { memo, useMemo } from 'react'
import { MENU_ITEMS } from '../../data/menu'
import { t } from '../../i18n/messages'
import { useRestaurantStore } from '../../store/useRestaurantStore'
import { formatCurrency } from '../../utils/format'

export const MenuGrid = memo(function MenuGrid() {
  const activeCategoryId = useRestaurantStore((s) => s.activeCategoryId)
  const searchQuery = useRestaurantStore((s) => s.searchQuery)
  const openAddItem = useRestaurantStore((s) => s.openAddItem)

  const items = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = query ? true : item.categoryId === activeCategoryId
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [activeCategoryId, searchQuery])

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-cmd-muted">
        {t.order.noResults}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => openAddItem(item.id)}
          className="flex min-h-[72px] items-center justify-between gap-3 rounded-xl border border-cmd-border bg-cmd-surface-2 px-4 py-3 text-left transition-all active:scale-[0.98] hover:border-cmd-accent/40 hover:bg-cmd-surface-3"
        >
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-cmd-text">{item.name}</p>
            {item.description && (
              <p className="truncate text-xs text-cmd-muted">{item.description}</p>
            )}
            {item.allergens.length > 0 && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-cmd-warning">
                <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
                {item.allergens.join(', ')}
              </p>
            )}
          </div>
          <span className="shrink-0 text-base font-bold text-cmd-accent">
            {formatCurrency(item.price)}
          </span>
        </button>
      ))}
    </div>
  )
})