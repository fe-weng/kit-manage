import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
import MonthCalendar from '@/presentation/components/MonthCalendar'
import { useTaskHistoryStore } from '@/presentation/hooks/useTaskHistoryStore'
import DateView from './DateView'
import type { ReactNode } from 'react'

type ViewMode = 'date' | 'task'

const TABS: { key: ViewMode; label: string }[] = [
  { key: 'date', label: '按日期' },
  { key: 'task', label: '按任务' },
]

const LEVEL_COLORS: Record<string, string> = {
  full: 'bg-accent',
  high: 'bg-warning',
  low: 'bg-danger',
  none: 'bg-border',
}

export default function TaskHistoryPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('date')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { fetchMonth, ensureTodaySnapshot, dateStatusMap, loading } = useTaskHistoryStore()

  useEffect(() => {
    ensureTodaySnapshot().then(() => fetchMonth(year, month))
  }, [year, month, ensureTodaySnapshot, fetchMonth])

  const handleMonthChange = useCallback((y: number, m: number) => {
    setYear(y)
    setMonth(m)
    setSelectedDate(null)
  }, [])

  const handleDayClick = useCallback((date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date))
  }, [])

  const renderDateCell = useCallback(
    (date: string): ReactNode => {
      const status = dateStatusMap[date]
      if (!status || status.level === 'empty') return null
      return (
        <span className={`inline-block w-[6px] h-[6px] rounded-full ${LEVEL_COLORS[status.level]}`} />
      )
    },
    [dateStatusMap],
  )

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
            onClick={() => {
              setViewMode(tab.key)
              setSelectedDate(null)
            }}
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <MonthCalendar
            year={year}
            month={month}
            onMonthChange={handleMonthChange}
            renderCell={viewMode === 'date' ? renderDateCell : () => null}
            onDayClick={viewMode === 'date' ? handleDayClick : undefined}
          />
        )}

        {/* Legend */}
        {viewMode === 'date' && !loading && (
          <div className="flex items-center justify-center gap-4 mt-2 pb-1">
            <LegendItem color="bg-accent" label="全部完成" />
            <LegendItem color="bg-warning" label="≥50%" />
            <LegendItem color="bg-danger" label="<50%" />
            <LegendItem color="bg-border" label="未完成" />
          </div>
        )}
      </div>

      {/* View Content */}
      {viewMode === 'date' ? (
        <DateView selectedDate={selectedDate} />
      ) : (
        <div className="text-center py-8 text-text-sub text-caption">
          任务视图 (T7)
        </div>
      )}
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-[6px] h-[6px] rounded-full ${color}`} />
      <span className="text-label text-text-sub">{label}</span>
    </div>
  )
}
