import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import { rewardService } from '@/shared/container'
import type { RewardLog } from '@/domain/models/RewardLog'
import { ROUTES } from '@/shared/constants'
import { create } from 'zustand'

interface HistoryStore {
  logs: RewardLog[]
  loading: boolean
  fetch: () => Promise<void>
}

const useHistoryStore = create<HistoryStore>((set) => ({
  logs: [],
  loading: false,
  fetch: async () => {
    set({ loading: true })
    const logs = await rewardService.getAllLogs()
    logs.sort((a, b) => b.redeemedAt - a.redeemedAt)
    set({ logs, loading: false })
  },
}))

export default function RedeemHistoryPage() {
  const navigate = useNavigate()
  const { logs, loading, fetch } = useHistoryStore()

  useEffect(() => {
    fetch()
  }, [fetch])

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
          onClick={() => navigate(ROUTES.MY_COUPONS)}
          className="flex items-center justify-center active:scale-90 transition-transform"
          style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} weight="bold" className="text-text-main" />
        </button>
        <h1 className="text-[20px] font-bold text-text-main">📋 兑换记录</h1>
      </div>

      {loading && logs.length === 0 && (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <span className="inline-block w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="flex flex-col items-center" style={{ padding: '48px 0', gap: '12px' }}>
          <span className="text-[40px]">📋</span>
          <p className="text-[15px] text-text-sub">还没有兑换记录</p>
        </div>
      )}

      <div className="flex flex-col" style={{ gap: '8px' }}>
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-card rounded-[12px] flex items-center justify-between"
            style={{ padding: '14px 16px' }}
          >
            <div className="flex flex-col" style={{ gap: '4px' }}>
              <span className="text-[14px] font-medium text-text-main">{log.rewardTitle}</span>
              <span className="text-[12px] text-text-sub">
                {new Date(log.redeemedAt).toLocaleDateString('zh-CN')}
                {' '}
                {new Date(log.redeemedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex flex-col items-end" style={{ gap: '2px' }}>
              <span className="text-[13px] font-bold text-warning">-{log.pointsCost}分</span>
              <span className="text-[11px] text-text-sub">
                {log.status === 'pending' ? '⏳ 待使用' : '✅ 已使用'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
