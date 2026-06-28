import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { memo } from 'react'
import { t } from '../../i18n/messages'
import type { KitchenTicket } from '../../types/restaurant'
import { formatDateTime } from '../../utils/format'

interface KitchenTicketCardProps {
  ticket: KitchenTicket
  index: number
}

export const KitchenTicketCard = memo(function KitchenTicketCard({
  ticket,
  index,
}: KitchenTicketCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border-2 border-cmd-accent/30 bg-cmd-surface p-4 shadow-lg shadow-cmd-accent/5"
    >
      <header className="mb-3 flex items-center justify-between border-b border-dashed border-cmd-border pb-3">
        <div>
          <h3 className="text-xl font-bold text-cmd-text">{ticket.tableLabel}</h3>
          <p className="text-sm text-cmd-muted">
            {t.kitchen.round} {ticket.round}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-cmd-accent">
          <Clock className="h-4 w-4" aria-hidden />
          {formatDateTime(ticket.sentAt)}
        </div>
      </header>

      <ul className="space-y-2 font-mono text-base">
        {ticket.items.map((item) => (
          <li key={item.id} className="border-b border-cmd-border/50 pb-2 last:border-0">
            <span className="text-2xl font-bold text-cmd-accent">{item.quantity}</span>
            <span className="ml-2 font-semibold text-cmd-text">{item.name}</span>
            {item.notes && (
              <p className="mt-0.5 pl-8 text-sm font-bold uppercase text-cmd-warning">
                ⚠ {item.notes}
              </p>
            )}
          </li>
        ))}
      </ul>
    </motion.article>
  )
})