import { UtensilsCrossed } from 'lucide-react'
import { t } from '../../i18n/messages'

const SUBTITLES = {
  tables: t.app.tagline,
  kitchen: t.app.kitchenTagline,
  settings: t.app.settingsTagline,
} as const

interface AppHeaderProps {
  subtitle: keyof typeof SUBTITLES
}

export function AppHeader({ subtitle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-cmd-border bg-cmd-bg/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cmd-accent/15 text-cmd-accent">
          <UtensilsCrossed className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-cmd-text">{t.app.name}</h1>
          <p className="text-sm text-cmd-muted">{SUBTITLES[subtitle]}</p>
        </div>
      </div>
    </header>
  )
}