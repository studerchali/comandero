import { ChefHat } from 'lucide-react'
import { t } from '../../i18n/messages'
import { useRestaurantStore } from '../../store/useRestaurantStore'
import { KitchenTicketCard } from './KitchenTicketCard'

export function KitchenView() {
  const kitchenTickets = useRestaurantStore((s) => s.kitchenTickets)

  return (
    <div className="px-4 pb-28 pt-2">
      <div className="mb-4 rounded-xl bg-cmd-surface-2 px-4 py-3">
        <p className="text-sm text-cmd-muted">
          {t.kitchen.description}
        </p>
      </div>

      {kitchenTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ChefHat className="h-16 w-16 text-cmd-muted/40" aria-hidden />
          <p className="mt-4 text-lg font-medium text-cmd-muted">{t.kitchen.empty}</p>
          <p className="mt-1 text-sm text-cmd-muted/70">{t.kitchen.emptyHint}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kitchenTickets.map((ticket, index) => (
            <KitchenTicketCard key={ticket.id} ticket={ticket} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}