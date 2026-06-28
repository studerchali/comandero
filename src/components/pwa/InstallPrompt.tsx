import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { t } from '../../i18n/messages'
import { Button } from '../../ui/Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'comandero-pwa-dismissed'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return

    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-lg rounded-2xl border border-cmd-accent/30 bg-cmd-surface p-4 shadow-2xl shadow-black/40 sm:bottom-6"
      role="region"
      aria-label="Instalar aplicación"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cmd-accent/15 text-cmd-accent">
          <Download className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-cmd-text">{t.pwa.installTitle}</p>
          <p className="mt-0.5 text-sm text-cmd-muted">{t.pwa.installBody}</p>
          <div className="mt-3 flex gap-2">
            <Button size="md" onClick={() => void handleInstall()}>
              {t.pwa.install}
            </Button>
            <Button size="md" variant="ghost" onClick={handleDismiss}>
              {t.pwa.dismiss}
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-cmd-muted hover:bg-cmd-surface-2"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}