import { Ticket } from '@phosphor-icons/react'
import type { RewardLog } from '@/domain/models/RewardLog'

interface CouponMiniCardProps {
  coupons: RewardLog[]
  onTap: () => void
}

export default function CouponMiniCard({ coupons, onTap }: CouponMiniCardProps) {
  const count = coupons.length
  const latest = coupons[0]!

  return (
    <button
      onClick={onTap}
      className="w-full text-left active:scale-[0.98] transition-transform"
      style={{
        backgroundColor: '#FFF8F0',
        borderRadius: '20px',
        padding: '16px 18px',
        boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9)',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center" style={{ gap: '14px' }}>
        {/* Coupon icon */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '4px 4px 8px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)',
            flexShrink: 0,
          }}
        >
          <Ticket size={28} weight="duotone" style={{ color: 'var(--color-accent)' }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              待使用券
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-accent)',
                backgroundColor: 'rgba(126,207,192,0.15)',
                borderRadius: '8px',
                padding: '2px 8px',
              }}
            >
              {count}张
            </span>
          </div>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-sub)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {latest.rewardTitle}
            {count > 1 && ` 等${count}张`}
          </p>
        </div>
      </div>
    </button>
  )
}
