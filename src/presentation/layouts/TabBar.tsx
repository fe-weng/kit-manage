import { useLocation, useNavigate } from 'react-router-dom'
import {
  House,
  CheckCircle,
  PawPrint,
  Gift,
  GearSix,
} from '@phosphor-icons/react'
import { ROUTES } from '@/shared/constants'

interface TabItem {
  path: string
  matchPaths: string[]
  label: string
  icon: typeof House
}

const tabs: TabItem[] = [
  { path: ROUTES.HOME, matchPaths: [ROUTES.HOME], label: '首页', icon: House },
  { path: ROUTES.TASKS, matchPaths: [ROUTES.TASKS, ROUTES.TASKS_MANAGE], label: '任务', icon: CheckCircle },
  { path: ROUTES.PET, matchPaths: [ROUTES.PET], label: '宠物', icon: PawPrint },
  { path: ROUTES.SHOP, matchPaths: [ROUTES.SHOP], label: '商城', icon: Gift },
  { path: ROUTES.SETTINGS, matchPaths: [ROUTES.SETTINGS], label: '设置', icon: GearSix },
]

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50" style={{ maxWidth: 'var(--app-max-width, 480px)' }}>
      <div className="mx-4 mb-2 bg-white rounded-clay shadow-clay flex items-center justify-around h-[68px] px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        {tabs.map((tab) => {
          const isActive = tab.matchPaths.some((p) => location.pathname.startsWith(p))
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-2 transition-colors"
            >
              <Icon
                size={24}
                weight={isActive ? 'fill' : 'regular'}
                className={isActive ? 'text-primary' : 'text-text-sub'}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-primary' : 'text-text-sub'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
