import { Outlet } from 'react-router-dom'
import TabBar from './TabBar'

export default function AppLayout() {
  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-bg">
      <main
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
