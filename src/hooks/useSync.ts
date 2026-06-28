import { useEffect, useRef } from 'react'
import { SYNC_ENABLED } from '../constants/app'
import {
  applyRemoteState,
  pullState,
  pushState,
  schedulePush,
  type SyncStatus,
} from '../services/syncManager'
import { useRestaurantStore } from '../store/useRestaurantStore'

function getPersistedSlice(state: ReturnType<typeof useRestaurantStore.getState>) {
  return {
    tables: state.tables,
    orders: state.orders,
    kitchenTickets: state.kitchenTickets,
  }
}

export function useSync() {
  const setSyncStatus = useRestaurantStore((s) => s.setSyncStatus)
  const initialPullDone = useRef(false)

  useEffect(() => {
    if (!SYNC_ENABLED) return

    const runPull = async () => {
      setSyncStatus('syncing')
      const result = await pullState()
      if (result.applied && result.record) {
        const remote = applyRemoteState(result.record)
        useRestaurantStore.setState({
          tables: remote.tables,
          orders: remote.orders,
          kitchenTickets: remote.kitchenTickets,
        })
      }
      setSyncStatus(result.status)
      initialPullDone.current = true
    }

    void runPull()

    const unsub = useRestaurantStore.subscribe((state, prevState) => {
      if (!initialPullDone.current) return

      const current = getPersistedSlice(state)
      const prev = getPersistedSlice(prevState)

      if (JSON.stringify(current) === JSON.stringify(prev)) return

      schedulePush(current, async (slice) => {
        setSyncStatus('syncing')
        const status: SyncStatus = await pushState(slice)
        setSyncStatus(status)
        return status
      })
    })

    const onOnline = () => {
      const slice = getPersistedSlice(useRestaurantStore.getState())
      void pushState(slice).then(setSyncStatus)
    }

    window.addEventListener('online', onOnline)
    return () => {
      unsub()
      window.removeEventListener('online', onOnline)
    }
  }, [setSyncStatus])
}