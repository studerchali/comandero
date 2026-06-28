import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { OrderLayout } from '../layouts/OrderLayout'
import { KitchenPage } from '../pages/KitchenPage'
import { OrderPage } from '../pages/OrderPage'
import { SettingsPage } from '../pages/SettingsPage'
import { TablesPage } from '../pages/TablesPage'
import { paths } from './paths'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={paths.home} element={<Navigate to={paths.tables} replace />} />
          <Route path={paths.tables} element={<TablesPage />} />
          <Route path={paths.kitchen} element={<KitchenPage />} />
          <Route path={paths.settings} element={<SettingsPage />} />
        </Route>

        <Route element={<OrderLayout />}>
          <Route path="/mesa/:tableId" element={<OrderPage />} />
        </Route>

        <Route path="*" element={<Navigate to={paths.tables} replace />} />
      </Routes>
    </BrowserRouter>
  )
}