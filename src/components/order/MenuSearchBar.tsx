import { Search, X } from 'lucide-react'
import { t } from '../../i18n/messages'
import { useRestaurantStore } from '../../store/useRestaurantStore'

export function MenuSearchBar() {
  const searchQuery = useRestaurantStore((s) => s.searchQuery)
  const setSearchQuery = useRestaurantStore((s) => s.setSearchQuery)

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cmd-muted"
        aria-hidden
      />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.order.searchPlaceholder}
        aria-label="Buscar artículo"
        className="w-full rounded-xl border border-cmd-border bg-cmd-surface-2 py-3.5 pl-12 pr-12 text-base text-cmd-text placeholder:text-cmd-muted/60 focus:border-cmd-accent focus:outline-none focus:ring-2 focus:ring-cmd-accent/30"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-cmd-muted hover:bg-cmd-surface-3 hover:text-cmd-text"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}