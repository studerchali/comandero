import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { t } from '../../i18n/messages'

export function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 bg-cmd-warning px-4 py-2 text-sm font-semibold text-cmd-bg"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4" aria-hidden />
      {t.pwa.offline}
    </div>
  )
}