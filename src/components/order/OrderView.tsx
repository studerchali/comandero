import type { Table } from '../../types/restaurant'
import { AddItemModal } from './AddItemModal'
import { CategoryTabs } from './CategoryTabs'
import { MenuGrid } from './MenuGrid'
import { MenuSearchBar } from './MenuSearchBar'
import { OrderPanel } from './OrderPanel'
import { PopularItems } from './PopularItems'
import { SendConfirmation } from './SendConfirmation'

interface OrderViewProps {
  table: Table
}

export function OrderView({ table }: OrderViewProps) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden lg:flex-row">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
          <MenuSearchBar />
          <CategoryTabs />
          <PopularItems />
          <MenuGrid />
        </div>

        <div className="shrink-0 border-t border-cmd-border lg:hidden">
          <OrderPanel tableId={table.id} tableLabel={table.label} compact />
        </div>
      </div>

      <aside className="hidden min-h-0 w-[380px] shrink-0 flex-col border-l border-cmd-border lg:flex">
        <OrderPanel tableId={table.id} tableLabel={table.label} />
      </aside>

      <AddItemModal />
      <SendConfirmation />
    </div>
  )
}