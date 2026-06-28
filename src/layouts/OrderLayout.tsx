import { Outlet } from 'react-router-dom'
import { OfflineIndicator } from '../components/pwa/OfflineIndicator'

export function OrderLayout() {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-cmd-bg">
      <OfflineIndicator />
      <main className="mx-auto min-h-0 w-full max-w-6xl flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}