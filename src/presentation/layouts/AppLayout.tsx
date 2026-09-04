import { Outlet } from 'react-router-dom'
import TabBar from './TabBar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg pb-[88px]">
      <Outlet />
      <TabBar />
    </div>
  )
}
