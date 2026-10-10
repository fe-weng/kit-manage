import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
import { useOutfitStore } from '@/presentation/hooks/useOutfitStore'
import { ROUTES } from '@/shared/constants'

function formatRedeemedAt(redeemedAt: number): string {
  const date = new Date(redeemedAt)
  const day = date.toLocaleDateString('zh-CN')
  const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${time}`
}

export default function PetOutfitHistoryPage() {
  const navigate = useNavigate()
  const { logs, fetchOutfits } = useOutfitStore()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchOutfits().finally(() => setLoaded(true))
  }, [fetchOutfits])

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 16px)',
        paddingBottom: '24px',
        paddingLeft: '20px',
        paddingRight: '20px',
        gap: '16px',
      }}
    >
      <div className="flex items-center" style={{ gap: '8px' }}>
        <button
          type="button"
          onClick={() => navigate(ROUTES.PET_OUTFITS)}
          aria-label="返回装扮页"
          className="flex items-center justify-center shrink-0"
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-main)',
          }}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
          兑换记录
        </h1>
      </div>

      {!loaded && (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <span className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {loaded && logs.length === 0 && (
        <div className="flex flex-col items-center" style={{ padding: '48px 0', gap: '12px' }}>
          <p className="text-[15px] text-text-sub" style={{ margin: 0 }}>还没有兑换记录</p>
        </div>
      )}

      {loaded && logs.length > 0 && (
        <div className="flex flex-col" style={{ gap: '8px' }}>
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-card rounded-[12px] flex items-center justify-between"
              style={{ padding: '14px 16px' }}
            >
              <div className="flex flex-col" style={{ gap: '4px', minWidth: 0 }}>
                <span className="text-[14px] font-medium text-text-main">{log.outfitName}</span>
                <span className="text-[12px] text-text-sub">{formatRedeemedAt(log.redeemedAt)}</span>
              </div>
              <span className="text-[13px] font-bold text-warning shrink-0">-{log.pointsCost}分</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
