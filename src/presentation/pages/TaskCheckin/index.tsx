import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GearSix, Check } from '@phosphor-icons/react'
import { useTaskStore } from '@/presentation/hooks/useTaskStore'
import { usePointStore } from '@/presentation/hooks/usePointStore'
import { useRewardStore } from '@/presentation/hooks/useRewardStore'
import { TaskType, getTaskTypeLabel } from '@/domain/valueObjects/TaskType'
import { formatPoints } from '@/domain/rules/PointRule'
import { ROUTES } from '@/shared/constants'
import NegativeBalanceGuide from './NegativeBalanceGuide'

export default function TaskCheckinPage() {
  const navigate = useNavigate()
  const { tasks, stats, fetchTasks, fetchStats, completeTask, uncompleteTask } = useTaskStore()
  const { balance, fetchBalance } = usePointStore()
  const { pendingCoupons, fetchPendingCoupons } = useRewardStore()

  useEffect(() => {
    fetchTasks()
    fetchStats()
    fetchBalance()
    fetchPendingCoupons()
  }, [fetchTasks, fetchStats, fetchBalance, fetchPendingCoupons])

  const dailyTasks = useMemo(() => tasks.filter((t) => t.task.type === TaskType.DAILY), [tasks])
  const weeklyTasks = useMemo(() => tasks.filter((t) => t.task.type === TaskType.WEEKLY), [tasks])
  const oneTimeTasks = useMemo(() => tasks.filter((t) => t.task.type === TaskType.ONE_TIME), [tasks])
  const negativeTasks = useMemo(() => tasks.filter((t) => t.task.type === TaskType.NEGATIVE), [tasks])
  const pendingCount = useMemo(
    () => tasks.filter((t) => !t.completed && t.task.type !== TaskType.NEGATIVE).length,
    [tasks],
  )

  const [processing, setProcessing] = useState(false)
  const processingRef = useRef(false)
  const [guideInfo, setGuideInfo] = useState<{
    taskId: string
    taskTitle: string
    taskPoints: number
    currentBalance: number
    afterBalance: number
  } | null>(null)

  const handleToggle = useCallback(async (taskId: string, completed: boolean) => {
    if (processingRef.current) return

    if (completed) {
      const item = tasks.find((t) => t.task.id === taskId)
      if (item && item.task.points > 0 && balance) {
        const afterBalance = balance.currentBalance - item.task.points
        if (afterBalance < 0) {
          setGuideInfo({
            taskId,
            taskTitle: item.task.title,
            taskPoints: item.task.points,
            currentBalance: balance.currentBalance,
            afterBalance,
          })
          return
        }
      }
    }

    processingRef.current = true
    setProcessing(true)
    try {
      if (completed) {
        await uncompleteTask(taskId)
      } else {
        await completeTask(taskId)
      }
    } finally {
      processingRef.current = false
      setProcessing(false)
    }
  }, [tasks, balance, uncompleteTask, completeTask])

  const handleForceCancel = useCallback(async () => {
    if (!guideInfo || processingRef.current) return
    setGuideInfo(null)
    processingRef.current = true
    setProcessing(true)
    try {
      await uncompleteTask(guideInfo.taskId)
    } finally {
      processingRef.current = false
      setProcessing(false)
    }
  }, [guideInfo, uncompleteTask])

  const handleGoReturn = useCallback(() => {
    setGuideInfo(null)
    navigate(ROUTES.MY_COUPONS)
  }, [navigate])

  const handleGuideClose = useCallback(() => {
    setGuideInfo(null)
  }, [])

  return (
    <div className="px-4 pb-4" style={{ paddingTop: 'calc(var(--safe-top, 0px) + 48px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-text-main">今日任务</h1>
        <button
          onClick={() => navigate('/tasks/manage')}
          className="flex items-center gap-1 text-caption text-text-sub active:scale-95 transition-transform"
        >
          <GearSix size={18} weight="bold" />
          <span>管理</span>
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-clay shadow-clay p-4 mb-6">
        <div className="grid grid-cols-3 text-center">
          <div>
            <div className="text-hero text-accent">{stats.completedCount}</div>
            <div className="text-label text-text-sub">已完成</div>
          </div>
          <div>
            <div className="text-hero text-pet-gold">{stats.earnedPoints >= 0 ? '+' : ''}{stats.earnedPoints}</div>
            <div className="text-label text-text-sub">已获积分</div>
          </div>
          <div>
            <div className="text-hero text-primary">+{pendingCount}</div>
            <div className="text-label text-text-sub">待完成</div>
          </div>
        </div>
      </div>

      {/* Daily Tasks */}
      {dailyTasks.length > 0 && (
        <TaskSection
          title={getTaskTypeLabel(TaskType.DAILY)}
          items={dailyTasks}
          onToggle={handleToggle}
          disabled={processing}
        />
      )}

      {/* Weekly Tasks */}
      {weeklyTasks.length > 0 && (
        <TaskSection
          title={getTaskTypeLabel(TaskType.WEEKLY)}
          items={weeklyTasks}
          onToggle={handleToggle}
          disabled={processing}
        />
      )}

      {/* One-time Tasks */}
      {oneTimeTasks.length > 0 && (
        <TaskSection
          title={getTaskTypeLabel(TaskType.ONE_TIME)}
          items={oneTimeTasks}
          onToggle={handleToggle}
          disabled={processing}
        />
      )}

      {/* Negative Behaviors */}
      {negativeTasks.length > 0 && (
        <TaskSection
          title={getTaskTypeLabel(TaskType.NEGATIVE)}
          items={negativeTasks}
          onToggle={handleToggle}
          isNegative
          disabled={processing}
        />
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-16 text-text-sub">
          <p className="text-heading mb-2">还没有任务</p>
          <button
            onClick={() => navigate(ROUTES.TASKS_MANAGE)}
            className="text-primary font-semibold"
          >
            去添加任务 →
          </button>
        </div>
      )}

      {/* Negative balance guide dialog */}
      <NegativeBalanceGuide
        visible={!!guideInfo}
        taskTitle={guideInfo?.taskTitle ?? ''}
        taskPoints={guideInfo?.taskPoints ?? 0}
        currentBalance={guideInfo?.currentBalance ?? 0}
        afterBalance={guideInfo?.afterBalance ?? 0}
        pendingCouponCount={pendingCoupons.length}
        onGoReturn={handleGoReturn}
        onForceCancel={handleForceCancel}
        onClose={handleGuideClose}
      />
    </div>
  )
}

function TaskSection({
  title,
  items,
  onToggle,
  isNegative = false,
  disabled = false,
}: {
  title: string
  items: Array<{ task: { id: string; title: string; points: number }; completed: boolean }>
  onToggle: (taskId: string, completed: boolean) => void
  isNegative?: boolean
  disabled?: boolean
}) {
  return (
    <div className="mb-4">
      <h3 className="text-caption font-semibold text-text-sub mb-2">{title}</h3>
      <div className="space-y-2">
        {items.map(({ task, completed }) => (
          <button
            key={task.id}
            disabled={disabled}
            onClick={() => onToggle(task.id, completed)}
            className={`w-full flex items-center gap-3 bg-white rounded-xl shadow-clay-button px-4 py-3 text-left transition-all active:scale-[0.98] ${
              completed ? 'opacity-70' : ''
            }`}
          >
            <div className="w-11 h-11 flex items-center justify-center flex-shrink-0 -ml-2">
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                  completed
                    ? isNegative
                      ? 'bg-danger border-danger'
                      : 'bg-accent border-accent'
                    : 'border-border'
                }`}
              >
                {completed && <Check size={16} weight="bold" className="text-white" />}
              </div>
            </div>
            <span
              className={`flex-1 text-body ${
                completed ? 'line-through text-text-sub' : 'text-text-main'
              }`}
            >
              {task.title}
            </span>
            <span
              className={`text-caption font-semibold ${
                completed
                  ? 'text-text-sub'
                  : isNegative
                    ? 'text-danger'
                    : 'text-accent'
              }`}
            >
              {formatPoints(task.points)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
