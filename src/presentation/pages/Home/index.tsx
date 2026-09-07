import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from '@phosphor-icons/react'
import { usePetStore } from '@/presentation/hooks/usePetStore'
import { useTaskStore } from '@/presentation/hooks/useTaskStore'
import { usePointStore } from '@/presentation/hooks/usePointStore'
import { useRewardStore } from '@/presentation/hooks/useRewardStore'
import { TaskType } from '@/domain/valueObjects/TaskType'
import { ROUTES } from '@/shared/constants'
import PetMiniCard from './PetMiniCard'
import CouponMiniCard from './CouponMiniCard'
import TodayTaskList from './TodayTaskList'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export default function HomePage() {
  const { status, loading: petLoading, fetchPet } = usePetStore()
  const { tasks, loading: taskLoading, fetchTasks, completeTask, uncompleteTask } = useTaskStore()
  const { balance, fetchBalance } = usePointStore()
  const { pendingCoupons, fetchPendingCoupons } = useRewardStore()
  const navigate = useNavigate()

  const loading = petLoading || taskLoading

  useEffect(() => {
    fetchPet()
    fetchTasks()
    fetchBalance()
    fetchPendingCoupons()
  }, [fetchPet, fetchTasks, fetchBalance, fetchPendingCoupons])

  const currentBalance = balance?.currentBalance ?? 0
  const petName = status?.pet.name ?? '小花花'

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.task.type !== TaskType.NEGATIVE && t.task.isActive),
    [tasks],
  )

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 20px)',
        paddingBottom: '100px',
        paddingLeft: '20px',
        paddingRight: '20px',
        gap: '16px',
      }}
    >
      {/* Header: greeting + points */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
          ※ {getGreeting()}！{petName}加油哦~
        </h1>
        <div
          className="flex items-center"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '6px 14px',
            gap: '4px',
            boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -2px -2px 6px rgba(255,255,255,0.8)',
          }}
        >
          <Star size={16} weight="fill" style={{ color: '#FFD54F' }} />
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)' }}>
            {currentBalance}
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && !status && tasks.length === 0 && (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <span className="inline-block w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* No Pet Guide */}
      {!loading && !status && (
        <button
          onClick={() => navigate(ROUTES.PET)}
          className="w-full bg-card rounded-[16px] shadow-clay flex items-center active:scale-[0.98] transition-transform"
          style={{ padding: '16px 18px', gap: '14px', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ fontSize: '36px' }}>🥚</span>
          <div className="flex flex-col" style={{ gap: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)' }}>还没有宠物</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-sub)' }}>去领养一只，陪你一起完成任务吧！</span>
          </div>
        </button>
      )}

      {/* Pet Mini Card */}
      {status && (
        <PetMiniCard
          petName={status.pet.name}
          petType={status.pet.type}
          stageName={status.stageName}
          stage={status.pet.stage}
          moodEmoji={status.pet.getMoodEmoji()}
          expProgress={status.expProgress}
          onTap={() => navigate(ROUTES.PET)}
        />
      )}

      {/* Coupon Mini Card */}
      {pendingCoupons.length > 0 && (
        <CouponMiniCard
          coupons={pendingCoupons}
          onTap={() => navigate(ROUTES.MY_COUPONS)}
        />
      )}

      {/* Today's Tasks */}
      <TodayTaskList
        tasks={todayTasks}
        onComplete={completeTask}
        onUncomplete={uncompleteTask}
        onManage={() => navigate(ROUTES.TASKS)}
      />
    </div>
  )
}
