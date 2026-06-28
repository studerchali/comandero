import { Cloud, CloudOff, Database, Info, RefreshCw, RotateCcw } from 'lucide-react'
import { API_URL, REPOSITORY_MODE, SYNC_ENABLED, APP_VERSION } from '../constants/app'
import { t } from '../i18n/messages'
import { getSyncMeta } from '../services/syncManager'
import { useRestaurantStore } from '../store/useRestaurantStore'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const syncLabels = {
  idle: t.settings.syncIdle,
  syncing: t.settings.syncSyncing,
  synced: t.settings.syncSynced,
  offline: t.settings.syncOffline,
  error: t.settings.syncError,
  conflict: t.settings.syncConflict,
  disabled: t.settings.syncDisabled,
} as const

const syncVariants = {
  idle: 'default',
  syncing: 'warning',
  synced: 'success',
  offline: 'warning',
  error: 'danger',
  conflict: 'danger',
  disabled: 'default',
} as const

function formatLastSynced(iso: string | null): string {
  if (!iso) return t.settings.neverSynced
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SettingsPage() {
  const resetAllData = useRestaurantStore((s) => s.resetAllData)
  const syncStatus = useRestaurantStore((s) => s.syncStatus)
  const syncNow = useRestaurantStore((s) => s.syncNow)
  const acceptRemoteState = useRestaurantStore((s) => s.acceptRemoteState)
  const forceLocalSync = useRestaurantStore((s) => s.forceLocalSync)

  const lastSynced = getSyncMeta().lastSyncedAt

  const handleReset = () => {
    if (confirm(t.settings.resetConfirm)) {
      resetAllData()
    }
  }

  return (
    <div className="space-y-6 px-4 pb-28 pt-2">
      <section className="rounded-2xl border border-cmd-border bg-cmd-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Cloud className="h-5 w-5 text-cmd-accent" aria-hidden />
          <h2 className="font-semibold text-cmd-text">{t.settings.sync}</h2>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={syncVariants[syncStatus]} label={syncLabels[syncStatus]} />
          {SYNC_ENABLED ? (
            <span className="text-xs text-cmd-muted">
              {t.settings.lastSynced}: {formatLastSynced(lastSynced)}
            </span>
          ) : null}
        </div>

        {SYNC_ENABLED ? (
          <div className="space-y-2">
            <p className="text-xs text-cmd-muted">
              API: <code className="text-cmd-accent">{API_URL || '/api (proxy dev)'}</code>
            </p>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => void syncNow()}
              disabled={syncStatus === 'syncing'}
            >
              <RefreshCw className={`h-5 w-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              {t.settings.syncNow}
            </Button>
            {syncStatus === 'conflict' ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" fullWidth onClick={acceptRemoteState}>
                  {t.settings.useServerData}
                </Button>
                <Button variant="primary" fullWidth onClick={() => void forceLocalSync()}>
                  {t.settings.useLocalData}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-cmd-muted">
            <CloudOff className="h-4 w-4 shrink-0" aria-hidden />
            {t.settings.syncDisabled}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-cmd-border bg-cmd-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Database className="h-5 w-5 text-cmd-accent" aria-hidden />
          <h2 className="font-semibold text-cmd-text">{t.settings.repository}</h2>
        </div>
        <p className="text-sm text-cmd-muted">
          {REPOSITORY_MODE === 'api' ? t.settings.repositoryApi : t.settings.repositoryLocal}
        </p>
        <p className="mt-2 text-xs text-cmd-muted">
          Modo: <code className="text-cmd-accent">{REPOSITORY_MODE}</code>
        </p>
      </section>

      <section className="rounded-2xl border border-cmd-border bg-cmd-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-5 w-5 text-cmd-accent" aria-hidden />
          <h2 className="font-semibold text-cmd-text">{t.settings.about}</h2>
        </div>
        <p className="text-sm text-cmd-muted">
          {t.app.name} — {t.settings.version} {APP_VERSION}
        </p>
      </section>

      <Button variant="danger" fullWidth onClick={handleReset}>
        <RotateCcw className="h-5 w-5" />
        {t.settings.resetData}
      </Button>
    </div>
  )
}