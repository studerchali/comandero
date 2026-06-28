import { ChefHat, LayoutGrid, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { t } from '../../i18n/messages'
import { paths } from '../../routes/paths'
import { useRestaurantStore } from '../../store/useRestaurantStore'

const TABS = [
  { to: paths.tables, label: t.nav.tables, icon: LayoutGrid },
  { to: paths.kitchen, label: t.nav.kitchen, icon: ChefHat, badge: true },
  { to: paths.settings, label: t.nav.settings, icon: Settings },
] as const

export function BottomTabBar() {
  const kitchenCount = useRestaurantStore((s) => s.kitchenTickets.length)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-cmd-border bg-cmd-surface/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-6xl">
        {TABS.map(({ to, label, icon: Icon, ...rest }) => {
          const showBadge = 'badge' in rest && rest.badge && kitchenCount > 0
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-sm font-semibold transition-colors active:scale-95 ${
                  isActive ? 'text-cmd-accent' : 'text-cmd-muted hover:text-cmd-text'
                }`
              }
            >
              <Icon className="h-6 w-6" aria-hidden />
              {label}
              {showBadge && (
                <span className="absolute right-1/4 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-cmd-accent px-1 text-xs font-bold text-white">
                  {kitchenCount > 9 ? '9+' : kitchenCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}