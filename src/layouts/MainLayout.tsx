import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { BottomTabBar } from '../components/layout/BottomTabBar'
import { InstallPrompt } from '../components/pwa/InstallPrompt'
import { OfflineIndicator } from '../components/pwa/OfflineIndicator'
import { useSync } from '../hooks/useSync'
import { paths } from '../routes/paths'

function resolveSubtitle(pathname: string): 'tables' | 'kitchen' | 'settings' {
  if (pathname.startsWith(paths.kitchen)) return 'kitchen'
  if (pathname.startsWith(paths.settings)) return 'settings'
  return 'tables'
}

export function MainLayout() {
  const { pathname } = useLocation()
  const subtitle = resolveSubtitle(pathname)
  useSync()

  return (
    <div className="flex min-h-full flex-col bg-cmd-bg">
      <OfflineIndicator />
      <AppHeader subtitle={subtitle} />
      <main className="mx-auto w-full max-w-6xl flex-1">
        <Outlet />
      </main>
      <BottomTabBar />
      <InstallPrompt />
    </div>
  )
}