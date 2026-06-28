import { registerSW } from 'virtual:pwa-register'
import { t } from './i18n/messages'

export function registerPWA(): void {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (confirm(t.pwa.update)) {
        void updateSW(true)
      }
    },
    onOfflineReady() {
      console.info('[Comandero] Listo para usar sin conexión.')
    },
  })
}