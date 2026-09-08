import { AnimatePresence, motion } from 'framer-motion'
import { WarningCircle, CheckCircle } from '@phosphor-icons/react'
import { useToastStore } from '@/shared/toast'

export default function GlobalToast() {
  const { message, type, visible } = useToastStore()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed left-1/2 -translate-x-1/2 z-[999] text-white text-[14px] font-medium rounded-[12px] shadow-float flex items-center"
          style={{
            bottom: 'calc(80px + var(--safe-bottom, 0px) + 24px)',
            padding: '10px 18px',
            gap: '8px',
            backgroundColor: type === 'success' ? 'var(--color-text-main)' : 'var(--color-danger)',
          }}
        >
          {type === 'success' ? (
            <CheckCircle size={18} weight="fill" />
          ) : (
            <WarningCircle size={18} weight="fill" />
          )}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
