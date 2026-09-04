import { motion, AnimatePresence } from 'framer-motion'
import { Confetti, Star } from '@phosphor-icons/react'
import { useEffect } from 'react'

interface RedeemSuccessProps {
  visible: boolean
  rewardTitle: string
  onDone: () => void
}

export default function RedeemSuccess({ visible, rewardTitle, onDone }: RedeemSuccessProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDone, 2500)
      return () => clearTimeout(timer)
    }
  }, [visible, onDone])

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
            style={{ padding: '36px 40px', gap: '12px' }}
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

            <p className="text-[12px] text-text-sub/60">点击任意处关闭</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
