import { memo } from 'react'
import { MENU_CATEGORIES } from '../../data/menu'
import { useRestaurantStore } from '../../store/useRestaurantStore'

export const CategoryTabs = memo(function CategoryTabs() {
  const activeCategoryId = useRestaurantStore((s) => s.activeCategoryId)
  const setActiveCategory = useRestaurantStore((s) => s.setActiveCategory)

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
      aria-label="Categorías del menú"
    >
      {MENU_CATEGORIES.map((cat) => {
        const isActive = activeCategoryId === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-95 ${
              isActive
                ? 'bg-cmd-accent text-white shadow-md shadow-cmd-accent/25'
                : 'bg-cmd-surface-2 text-cmd-muted hover:bg-cmd-surface-3 hover:text-cmd-text'
            }`}
          >
            {cat.name}
          </button>
        )
      })}
    </div>
  )
})