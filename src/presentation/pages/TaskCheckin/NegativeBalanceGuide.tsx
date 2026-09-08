import { WarningCircle, Ticket } from '@phosphor-icons/react'
import BaseModal from '@/presentation/components/BaseModal'

interface NegativeBalanceGuideProps {
  visible: boolean
  taskTitle: string
  taskPoints: number
  currentBalance: number
  afterBalance: number
  pendingCouponCount: number
  onGoReturn: () => void
  onForceCancel: () => void
  onClose: () => void
}

export default function NegativeBalanceGuide({
  visible,
  taskTitle,
  taskPoints,
  currentBalance,
  afterBalance,
  pendingCouponCount,
  onGoReturn,
  onForceCancel,
  onClose,
}: NegativeBalanceGuideProps) {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      titleId="negative-balance-title"
      dialogClassName="max-w-[320px] md:max-w-[400px]"
      dialogStyle={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '28px 24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      <div className="flex flex-col items-center" style={{ gap: '14px' }}>
        <WarningCircle size={40} weight="fill" className="text-danger" />

        <h3
          id="negative-balance-title"
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text-main)',
            margin: 0,
            textAlign: 'center',
          }}
        >
          积分不足
        </h3>

        <div
          style={{
            fontSize: '14px',
            color: 'var(--color-text-sub)',
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: '0 0 4px' }}>
            取消「{taskTitle}」将扣除 <strong>{taskPoints}</strong> 积分
          </p>
          <p style={{ margin: 0 }}>
            当前余额 <strong>{currentBalance}</strong> → 变为{' '}
            <strong style={{ color: 'var(--color-danger)' }}>{afterBalance}</strong> 分
          </p>
        </div>

        {pendingCouponCount > 0 && (
          <div
            className="w-full flex items-center rounded-[12px]"
            style={{
              padding: '10px 14px',
              gap: '10px',
              backgroundColor: 'var(--color-accent-light, #FFF8F0)',
              border: '1px solid var(--color-accent)',
            }}
          >
            <Ticket size={20} weight="bold" className="text-accent flex-shrink-0" />
            <span style={{ fontSize: '13px', color: 'var(--color-text-main)', lineHeight: 1.4 }}>
              你有 <strong>{pendingCouponCount}</strong> 张待使用的券可以退还，退还后积分恢复
            </span>
          </div>
        )}

        <div className="flex flex-col w-full" style={{ gap: '8px', marginTop: '6px' }}>
          {pendingCouponCount > 0 && (
            <button
              onClick={onGoReturn}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--color-accent)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              去退券
            </button>
          )}
          <button
            onClick={onForceCancel}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: pendingCouponCount > 0 ? 'transparent' : 'var(--color-danger)',
              color: pendingCouponCount > 0 ? 'var(--color-danger)' : '#FFFFFF',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '12px',
              border: pendingCouponCount > 0 ? '1.5px solid var(--color-danger)' : 'none',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            仍然取消
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text-sub)',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            返回
          </button>
        </div>
      </div>
    </BaseModal>
  )
}
