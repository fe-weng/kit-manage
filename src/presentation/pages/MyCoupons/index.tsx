import { useEffect, useMemo, useCallback, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ClockCountdown } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useRewardStore } from '@/presentation/hooks/useRewardStore'
import { rewardService } from '@/shared/container'
import type { RewardLog } from '@/domain/models/RewardLog'
import { ROUTES } from '@/shared/constants'
import { create } from 'zustand'
import ConfirmDialog from '@/presentation/pages/Settings/ConfirmDialog'

interface MyCouponsLocalStore {
  allLogs: RewardLog[]
  loading: boolean
  fetchAll: () => Promise<void>
}

const useLocalStore = create<MyCouponsLocalStore>((set) => ({
  allLogs: [],
  loading: false,
  fetchAll: async () => {
    set({ loading: true })
    const logs = await rewardService.getAllLogs()
    set({ allLogs: logs, loading: false })
  },
}))

function getTodayStart(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export default function MyCouponsPage() {
  const navigate = useNavigate()
  const { pendingCoupons, fetchPendingCoupons, markUsed, returnCoupon } = useRewardStore()
  const { allLogs, loading, fetchAll } = useLocalStore()

  useEffect(() => {
    fetchPendingCoupons()
    fetchAll()
  }, [fetchPendingCoupons, fetchAll])

  const todayUsed = useMemo(() => {
    const todayStart = getTodayStart()
    return allLogs.filter(
      (log) => log.status === 'used' && log.usedAt != null && log.usedAt >= todayStart,
    )
  }, [allLogs])

  const handleMarkUsed = useCallback(async (logId: string) => {
    await markUsed(logId)
    await fetchAll()
  }, [markUsed, fetchAll])

  const [returnTarget, setReturnTarget] = useState<RewardLog | null>(null)
  const returningRef = useRef(false)

  const handleReturnClick = useCallback((log: RewardLog) => {
    setReturnTarget(log)
  }, [])

  const handleReturnConfirm = useCallback(async () => {
    if (!returnTarget || returningRef.current) return
    returningRef.current = true
    await returnCoupon(returnTarget.id)
    await fetchAll()
    setReturnTarget(null)
    returningRef.current = false
  }, [returnTarget, returnCoupon, fetchAll])

  const handleReturnCancel = useCallback(() => {
    setReturnTarget(null)
  }, [])

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 16px)',
        paddingBottom: '100px',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}
    >
      {/* Header */}
      <div className="flex items-center" style={{ gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(ROUTES.SHOP)}
          className="flex items-center justify-center active:scale-90 transition-transform"
          style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} weight="bold" className="text-text-main" />
        </button>
        <h1 className="text-[20px] font-bold text-text-main">🎫 我的券</h1>
      </div>

      {/* Pending Coupons */}
      {pendingCoupons.length === 0 && !loading ? (
        <div className="flex flex-col items-center" style={{ padding: '48px 0', gap: '12px' }}>
          <span className="text-[40px]">🎫</span>
          <p className="text-[15px] text-text-sub">暂无待使用的券</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '10px', marginBottom: '24px' }}>
          <h2 className="text-[15px] font-bold text-text-main" style={{ marginBottom: '4px' }}>
            待使用 ({pendingCoupons.length})
          </h2>
          {pendingCoupons.map((log) => (
            <CouponCard key={log.id} log={log} onMarkUsed={handleMarkUsed} onReturn={handleReturnClick} />
          ))}
        </div>
      )}

      {/* Today Used */}
      {todayUsed.length > 0 && (
        <div className="flex flex-col" style={{ gap: '10px', marginBottom: '24px' }}>
          <h2 className="text-[15px] font-bold text-text-sub" style={{ marginBottom: '4px' }}>
            今日已使用
          </h2>
          {todayUsed.map((log) => (
            <UsedCouponCard key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* View all history link */}
      <button
        onClick={() => navigate(ROUTES.REDEEM_HISTORY)}
        className="text-[14px] text-accent font-medium active:opacity-70 transition-opacity self-center"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px' }}
      >
        查看全部兑换记录 →
      </button>

      {/* Return coupon confirm dialog */}
      <ConfirmDialog
        visible={!!returnTarget}
        title="退还券"
        message={returnTarget ? `确认退还「${returnTarget.rewardTitle}」？退还后将返还 ${returnTarget.pointsCost} 积分。` : ''}
        confirmLabel="确认退还"
        danger
        onConfirm={handleReturnConfirm}
        onCancel={handleReturnCancel}
      />
    </div>
  )
}

function CouponCard({
  log,
  onMarkUsed,
  onReturn,
}: {
  log: RewardLog
  onMarkUsed: (id: string) => void
  onReturn: (log: RewardLog) => void
}) {
  return (
    <motion.div
      className="bg-card rounded-[14px] shadow-clay flex items-center justify-between"
      style={{ padding: '14px 16px' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col" style={{ gap: '4px', flex: 1, minWidth: 0 }}>
        <span className="text-[15px] font-bold text-text-main truncate">{log.rewardTitle}</span>
        <div className="flex items-center" style={{ gap: '4px' }}>
          <ClockCountdown size={14} className="text-text-sub" />
          <span className="text-[12px] text-text-sub">
            {new Date(log.redeemedAt).toLocaleDateString('zh-CN')} 兑换 · {log.pointsCost}分
          </span>
        </div>
      </div>
      <div className="flex items-center" style={{ gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => onReturn(log)}
          className="font-medium rounded-[10px] active:scale-95 transition-all"
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            border: '1.5px solid #CCC',
            color: '#999',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          退还
        </button>
        <button
          onClick={() => onMarkUsed(log.id)}
          className="bg-accent text-white font-bold rounded-[10px] active:scale-95 transition-transform"
          style={{ padding: '8px 16px', fontSize: '13px', border: 'none', cursor: 'pointer' }}
        >
          点击使用
        </button>
      </div>
    </motion.div>
  )
}

function UsedCouponCard({ log }: { log: RewardLog }) {
  return (
    <div
      className="rounded-[14px] flex items-center justify-between"
      style={{ padding: '14px 16px', backgroundColor: '#F5F0EA', opacity: 0.6 }}
    >
      <div className="flex flex-col" style={{ gap: '4px' }}>
        <span className="text-[14px] text-text-sub line-through">{log.rewardTitle}</span>
        <span className="text-[12px] text-text-sub">
          {log.usedAt ? new Date(log.usedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''} 已使用
        </span>
      </div>
      <span className="text-[12px] text-text-sub font-medium">✅</span>
    </div>
  )
}
