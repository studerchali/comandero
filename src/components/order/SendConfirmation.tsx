import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { t } from '../../i18n/messages'
import { useRestaurantStore } from '../../store/useRestaurantStore'
import { Button } from '../../ui/Button'
import { formatDateTime } from '../../utils/format'

export function SendConfirmation() {
  const showSendConfirmation = useRestaurantStore((s) => s.showSendConfirmation)
  const lastTicketId = useRestaurantStore((s) => s.lastTicketId)
  const kitchenTickets = useRestaurantStore((s) => s.kitchenTickets)
  const dismissSendConfirmation = useRestaurantStore((s) => s.dismissSendConfirmation)

  const ticket = kitchenTickets.find((item) => item.id === lastTicketId)

  return (
    <AnimatePresence>
      {showSendConfirmation && ticket && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          role="alertdialog"
          aria-labelledby="send-confirm-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl border border-cmd-success/30 bg-cmd-surface p-6 text-center shadow-2xl"
          >
            <CheckCircle2 className="mx-auto h-16 w-16 text-cmd-success" aria-hidden />
            <h2 id="send-confirm-title" className="mt-4 text-xl font-bold text-cmd-text">
              {t.send.title}
            </h2>
            <p className="mt-2 text-cmd-muted">
              {ticket.tableLabel} · {t.kitchen.round} {ticket.round}
            </p>
            <p className="text-sm text-cmd-muted">{formatDateTime(ticket.sentAt)}</p>

            <ul className="mt-4 space-y-1 rounded-xl bg-cmd-surface-2 p-3 text-left text-sm">
              {ticket.items.map((item) => (
                <li key={item.id} className="text-cmd-text">
                  <strong>{item.quantity}×</strong> {item.name}
                  {item.notes && <span className="text-cmd-warning"> ({item.notes})</span>}
                </li>
              ))}
            </ul>

            <Button fullWidth size="lg" className="mt-5" onClick={dismissSendConfirmation}>
              {t.send.continue}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}