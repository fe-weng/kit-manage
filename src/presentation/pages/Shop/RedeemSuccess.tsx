import { motion, AnimatePresence } from 'framer-motion'
import { Confetti, Star, Ticket } from '@phosphor-icons/react'

interface RedeemSuccessProps {
  visible: boolean
  rewardTitle: string
  onDone: () => void
  onViewCoupons?: () => void
}

export default function RedeemSuccess({ visible, rewardTitle, onDone, onViewCoupons }: RedeemSuccessProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-[120] flex items-center justify-center"
          onClick={onDone}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-white rounded-[24px] shadow-float flex flex-col items-center"
            style={{ padding: '36px 40px', gap: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              <Confetti size={48} weight="duotone" className="text-warning" />
            </motion.div>

            <div className="flex items-center" style={{ gap: '4px' }}>
              <Star size={20} weight="fill" className="text-pet-gold" />
              <h2 className="text-[22px] font-bold text-text-main">兑换成功！</h2>
              <Star size={20} weight="fill" className="text-pet-gold" />
            </div>

            <p className="text-[15px] text-text-sub text-center">
              成功兑换 <span className="font-bold text-accent">{rewardTitle}</span>
            </p>

            <div className="flex flex-col w-full" style={{ gap: '8px', marginTop: '4px' }}>
              {onViewCoupons && (
                <button
                  onClick={onViewCoupons}
                  className="w-full bg-accent text-white font-bold rounded-[12px] flex items-center justify-center active:scale-95 transition-transform"
                  style={{ padding: '12px', fontSize: '15px', gap: '6px', border: 'none', cursor: 'pointer' }}
                >
                  <Ticket size={18} weight="duotone" />
                  查看我的券
                </button>
              )}
              <button
                onClick={onDone}
                className="w-full text-text-sub font-medium rounded-[12px] active:opacity-70 transition-opacity"
                style={{ padding: '10px', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                继续逛逛
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
