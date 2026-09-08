import { useMemo } from 'react'
import { Check, X } from '@phosphor-icons/react'
import { useTaskHistoryStore } from '@/presentation/hooks/useTaskHistoryStore'
import { getDayRange } from '@/domain/rules/DateUtils'

interface DateViewProps {
  selectedDate: string | null
}

export default function DateView({ selectedDate }: DateViewProps) {
  const { snapshots, logs, allTasks, dateStatusMap } = useTaskHistoryStore()

  const dayDetail = useMemo(() => {
    if (!selectedDate) return null
    const snap = snapshots.find((s) => s.date === selectedDate)
    if (!snap) return null

    const { start: dayStart, end: dayEnd } = getDayRange(selectedDate)
    const dayLogs = logs.filter((l) => l.completedAt >= dayStart && l.completedAt < dayEnd)
    const completedIds = new Set(dayLogs.map((l) => l.taskId))

    const taskDetails = snap.taskIds.map((id) => {
      const task = allTasks.find((t) => t.id === id)
      return {
        id,
        title: task?.title ?? '(已删除)',
        points: task?.points ?? 0,
        completed: completedIds.has(id),
      }
    })

    const negativeDetails = snap.negativeTaskIds.map((id) => {
      const task = allTasks.find((t) => t.id === id)
      const triggered = dayLogs.filter((l) => l.taskId === id).length
      return {
        id,
        title: task?.title ?? '(已删除)',
        points: task?.points ?? 0,
        triggeredCount: triggered,
      }
    })

    const status = dateStatusMap[selectedDate]

    return { taskDetails, negativeDetails, status }
  }, [selectedDate, snapshots, logs, allTasks, dateStatusMap])

  const formattedDate = useMemo(() => {
    if (!selectedDate) return ''
    const parts = selectedDate.split('-')
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    return `${d.getMonth() + 1}月${d.getDate()}日 周${weekDays[d.getDay()]}`
  }, [selectedDate])

  return (
    <>
      {/* Day detail expand */}
      {selectedDate && dayDetail && (
        <div className="bg-white rounded-clay shadow-clay p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-body font-semibold text-text-main">{formattedDate}</span>
            {dayDetail.status && (
              <span className="text-caption text-text-sub">
                {dayDetail.status.completedTasks}/{dayDetail.status.totalTasks} 已完成
              </span>
            )}
          </div>

          {/* Positive tasks */}
          {dayDetail.taskDetails.length > 0 && (
            <div className="space-y-2 mb-3">
              {dayDetail.taskDetails.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      t.completed ? 'bg-accent' : 'bg-border'
                    }`}
                  >
                    {t.completed ? (
                      <Check size={12} weight="bold" className="text-white" />
                    ) : (
                      <X size={12} weight="bold" className="text-text-sub" />
                    )}
                  </span>
                  <span
                    className={`flex-1 text-caption ${
                      t.completed ? 'text-text-main' : 'text-text-sub'
                    }`}
                  >
                    {t.title}
                  </span>
                  <span className="text-label text-text-sub">+{t.points}</span>
                </div>
              ))}
            </div>
          )}

          {/* Negative tasks */}
          {dayDetail.negativeDetails.length > 0 && (
            <>
              <div className="text-label text-text-sub mb-1 mt-2">扣分行为</div>
              <div className="space-y-2">
                {dayDetail.negativeDetails.map((t) => (
                  <div key={t.id} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-danger/20">
                      <span className="text-[10px] font-bold text-danger">
                        {t.triggeredCount > 0 ? t.triggeredCount : '-'}
                      </span>
                    </span>
                    <span className="flex-1 text-caption text-text-main">{t.title}</span>
                    <span className="text-label text-danger">{t.points}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {dayDetail.taskDetails.length === 0 && dayDetail.negativeDetails.length === 0 && (
            <div className="text-center text-caption text-text-sub py-4">
              当天无任务记录
            </div>
          )}
        </div>
      )}
    </>
  )
}

