import { useMemo, useRef, useEffect } from 'react'
import { useTaskHistoryStore } from '@/presentation/hooks/useTaskHistoryStore'

interface TaskViewProps {
  selectedTaskId: string | null
  onSelectTask: (taskId: string | null) => void
  taskDayStatus: Record<string, 'done' | 'planned'>
}

export default function TaskView({ selectedTaskId, onSelectTask, taskDayStatus }: TaskViewProps) {
  const { snapshots, allTasks } = useTaskHistoryStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const visibleTasks = useMemo(() => {
    const taskIdSet = new Set<string>()
    for (const snap of snapshots) {
      for (const id of snap.taskIds) taskIdSet.add(id)
    }
    return allTasks.filter((t) => taskIdSet.has(t.id))
  }, [snapshots, allTasks])

  const negativeTasks = useMemo(() => {
    const taskIdSet = new Set<string>()
    for (const snap of snapshots) {
      for (const id of snap.negativeTaskIds) taskIdSet.add(id)
    }
    return allTasks.filter((t) => taskIdSet.has(t.id))
  }, [snapshots, allTasks])

  const allSelectableTasks = useMemo(
    () => [...visibleTasks, ...negativeTasks],
    [visibleTasks, negativeTasks],
  )

  useEffect(() => {
    const first = allSelectableTasks[0]
    if (!selectedTaskId && first) {
      onSelectTask(first.id)
    }
  }, [allSelectableTasks, selectedTaskId, onSelectTask])

  const stats = useMemo(() => {
    const entries = Object.values(taskDayStatus)
    const planned = entries.filter((v) => v !== null).length
    const done = entries.filter((v) => v === 'done').length
    return { planned, done, rate: planned > 0 ? Math.round((done / planned) * 100) : 0 }
  }, [taskDayStatus])

  return (
    <>
      {/* Task Chips */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allSelectableTasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-caption font-medium transition-all ${
              selectedTaskId === task.id
                ? 'bg-primary text-white shadow-clay-button'
                : 'bg-input-bg text-text-sub'
            }`}
          >
            {task.title}
          </button>
        ))}
        {allSelectableTasks.length === 0 && (
          <span className="text-caption text-text-sub">本月无任务记录</span>
        )}
      </div>

      {/* Stats */}
      {selectedTaskId && (
        <div className="bg-white rounded-clay shadow-clay p-4 mb-4">
          <div className="grid grid-cols-3 text-center">
            <div>
              <div className="text-heading font-bold text-accent">{stats.done}</div>
              <div className="text-label text-text-sub">完成天数</div>
            </div>
            <div>
              <div className="text-heading font-bold text-text-main">{stats.planned}</div>
              <div className="text-label text-text-sub">计划天数</div>
            </div>
            <div>
              <div className="text-heading font-bold text-primary">{stats.rate}%</div>
              <div className="text-label text-text-sub">完成率</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
