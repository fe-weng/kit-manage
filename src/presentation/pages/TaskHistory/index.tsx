import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
import MonthCalendar from '@/presentation/components/MonthCalendar'

type ViewMode = 'date' | 'task'

const TABS: { key: ViewMode; label: string }[] = [
  { key: 'date', label: '按日期' },
  { key: 'task', label: '按任务' },
]

export default function TaskHistoryPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('date')

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y)
    setMonth(m)
  }, [])

  return (
    <div className="px-4 pb-4" style={{ paddingTop: 'calc(var(--safe-top, 0px) + 12px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
        >
          <CaretLeft size={22} weight="bold" className="text-text-main" />
        </button>
        <h1 className="text-[20px] font-bold text-text-main flex-1">打卡历史</h1>
      </div>

      {/* Segment Control */}
      <div className="flex bg-input-bg rounded-xl p-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            className={`flex-1 py-2 text-center text-caption font-semibold rounded-lg transition-all ${
              viewMode === tab.key
                ? 'bg-white text-text-main shadow-clay-button'
                : 'text-text-sub'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-clay shadow-clay p-3 mb-4">
        <MonthCalendar
          year={year}
          month={month}
          onMonthChange={handleMonthChange}
          renderCell={() => null}
        />
      </div>

      {/* Placeholder for DateView / TaskView */}
      <div className="text-center py-8 text-text-sub text-caption">
        {viewMode === 'date' ? '日期视图 (T6)' : '任务视图 (T7)'}
      </div>
    </div>
  )
}
