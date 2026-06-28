import { Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { t } from '../../i18n/messages'
import { getPendingMenuItem, useRestaurantStore } from '../../store/useRestaurantStore'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { formatCurrency } from '../../utils/format'

export function AddItemModal() {
  const pendingMenuItemId = useRestaurantStore((s) => s.pendingMenuItemId)
  const closeAddItem = useRestaurantStore((s) => s.closeAddItem)
  const addItemToOrder = useRestaurantStore((s) => s.addItemToOrder)

  const menuItem = getPendingMenuItem()
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (pendingMenuItemId) {
      setQuantity(1)
      setNotes('')
    }
  }, [pendingMenuItemId])

  if (!pendingMenuItemId || !menuItem) return null

  const handleAdd = () => addItemToOrder(menuItem.id, quantity, notes)

  const toggleQuickNote = (note: string) => {
    setNotes((prev) => {
      if (prev.includes(note)) {
        return prev
          .split(', ')
          .filter((n) => n !== note)
          .join(', ')
      }
      return prev ? `${prev}, ${note}` : note
    })
  }

  return (
    <Modal
      isOpen
      onClose={closeAddItem}
      title={menuItem.name}
      footer={
        <Button fullWidth size="xl" onClick={handleAdd}>
          {t.order.addToOrder} · {formatCurrency(menuItem.price * quantity)}
        </Button>
      }
    >
      <p className="mb-4 font-semibold text-cmd-accent">{formatCurrency(menuItem.price)}</p>

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-cmd-muted">{t.order.quantity}</p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Reducir cantidad"
          >
            <Minus className="h-5 w-5" />
          </Button>
          <span className="min-w-[3rem] text-center text-3xl font-bold text-cmd-text">
            {quantity}
          </span>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {menuItem.quickNotes.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-cmd-muted">{t.order.quickNotes}</p>
          <div className="flex flex-wrap gap-2">
            {menuItem.quickNotes.map((note) => {
              const selected = notes.includes(note)
              return (
                <button
                  key={note}
                  type="button"
                  onClick={() => toggleQuickNote(note)}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-all active:scale-95 ${
                    selected
                      ? 'bg-cmd-accent text-white'
                      : 'bg-cmd-surface-2 text-cmd-muted hover:text-cmd-text'
                  }`}
                >
                  {note}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="item-notes" className="mb-2 block text-sm font-medium text-cmd-muted">
          {t.order.specialNote}
        </label>
        <input
          id="item-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.order.notePlaceholder}
          className="w-full rounded-xl border border-cmd-border bg-cmd-surface-2 px-4 py-3.5 text-base text-cmd-text placeholder:text-cmd-muted/50 focus:border-cmd-accent focus:outline-none focus:ring-2 focus:ring-cmd-accent/30"
        />
      </div>
    </Modal>
  )
}