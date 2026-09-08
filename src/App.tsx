import { lazy, Suspense, useEffect } from 'react'
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

const prefetchPages = [
  () => import('./presentation/pages/Home'),
  () => import('./presentation/pages/TaskCheckin'),
  () => import('./presentation/pages/TaskManage'),
  () => import('./presentation/pages/Pet'),
  () => import('./presentation/pages/Shop'),
  () => import('./presentation/pages/MyCoupons'),
  () => import('./presentation/pages/RedeemHistory'),
  () => import('./presentation/pages/TaskHistory'),
  () => import('./presentation/pages/Settings'),
]

function App() {
  useEffect(() => {
    const prefetch = () => prefetchPages.forEach((load) => load())
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch)
    } else {
      setTimeout(prefetch, 2000)
    }
  }, [])

  return (
    <BrowserRouter basename="/kit-manage">
      <GlobalToast />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-bg">
          <span className="inline-block w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      }>
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
