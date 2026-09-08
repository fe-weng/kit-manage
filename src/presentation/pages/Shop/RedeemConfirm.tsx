import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X } from '@phosphor-icons/react'
import type { Reward } from '@/domain/models/Reward'

interface RedeemConfirmProps {
  visible: boolean
  reward: Reward | null
  balance: number
  redeeming: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function RedeemConfirm({
  visible,
  reward,
  balance,
  redeeming,
  onConfirm,
  onCancel,
}: RedeemConfirmProps) {
  if (!reward) return null

  const afterBalance = balance - reward.points

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[110]"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[111] pointer-events-none"
            style={{ padding: '0 24px' }}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="relative bg-white rounded-[20px] shadow-float w-full max-w-[300px] md:max-w-[380px] pointer-events-auto"
              style={{ padding: '28px 24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onCancel}
                aria-label="取消"
                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-text-sub"
              >
                <X size={18} weight="bold" />
              </button>

              <div className="flex flex-col items-center" style={{ gap: '16px' }}>
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-[32px]">{reward.icon || '🎁'}</span>
                </div>

                <h3 className="text-[18px] font-bold text-text-main text-center">
                  确认兑换？
                </h3>

                <div className="w-full bg-input-bg rounded-[12px]" style={{ padding: '12px 16px' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                    <span className="text-[13px] text-text-sub">奖励</span>
                    <span className="text-[14px] font-medium text-text-main">{reward.title}</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                    <span className="text-[13px] text-text-sub">消耗积分</span>
                    <span className="text-[14px] font-bold text-danger">-{reward.points}</span>
                  </div>
                  <div className="w-full h-px bg-input-border" style={{ margin: '6px 0' }} />
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-text-sub">兑换后余额</span>
                    <span className="text-[14px] font-bold text-accent">{afterBalance}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex w-full" style={{ gap: '10px' }}>
                  <button
                    onClick={onCancel}
                    className="flex-1 bg-input-bg text-text-sub font-semibold text-[14px] rounded-[12px] min-h-[44px] active:scale-95 transition-transform"
                  >
                    取消
                  </button>
                  <motion.button
                    onClick={onConfirm}
                    disabled={redeeming}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-accent text-white font-bold text-[14px] rounded-[12px] min-h-[44px] shadow-clay-button flex items-center justify-center disabled:opacity-50"
                    style={{ gap: '6px' }}
                  >
                    {redeeming ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag size={16} weight="bold" />
                        <span>确认</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
