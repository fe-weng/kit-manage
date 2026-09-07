import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './presentation/layouts/AppLayout'
import GlobalToast from './presentation/components/GlobalToast'
import { ROUTES } from './shared/constants'

const HomePage = lazy(() => import('./presentation/pages/Home'))
const TaskCheckinPage = lazy(() => import('./presentation/pages/TaskCheckin'))
const TaskManagePage = lazy(() => import('./presentation/pages/TaskManage'))
const PetPage = lazy(() => import('./presentation/pages/Pet'))
const ShopPage = lazy(() => import('./presentation/pages/Shop'))
const MyCouponsPage = lazy(() => import('./presentation/pages/MyCoupons'))
const RedeemHistoryPage = lazy(() => import('./presentation/pages/RedeemHistory'))
const TaskHistoryPage = lazy(() => import('./presentation/pages/TaskHistory'))
const SettingsPage = lazy(() => import('./presentation/pages/Settings'))

function App() {
  return (
    <BrowserRouter>
      <GlobalToast />
      <Suspense>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to={ROUTES.HOME} replace />} />
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.TASKS} element={<TaskCheckinPage />} />
            <Route path={ROUTES.TASKS_MANAGE} element={<TaskManagePage />} />
            <Route path={ROUTES.TASK_HISTORY} element={<TaskHistoryPage />} />
            <Route path={ROUTES.PET} element={<PetPage />} />
            <Route path={ROUTES.SHOP} element={<ShopPage />} />
            <Route path={ROUTES.MY_COUPONS} element={<MyCouponsPage />} />
            <Route path={ROUTES.REDEEM_HISTORY} element={<RedeemHistoryPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
