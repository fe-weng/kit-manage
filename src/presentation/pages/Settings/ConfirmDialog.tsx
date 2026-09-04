import { motion, AnimatePresence } from 'framer-motion'
import { WarningCircle } from '@phosphor-icons/react'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none"
            style={{ padding: '0 24px' }}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-[320px] md:max-w-[400px]"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '28px 24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center" style={{ gap: '14px' }}>
                {danger && (
                  <WarningCircle size={40} weight="fill" className="text-danger" />
                )}
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0, textAlign: 'center' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-sub)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                  {message}
                </p>

                <div className="flex w-full" style={{ gap: '10px', marginTop: '6px' }}>
                  <button
                    onClick={onCancel}
                    style={{
                      flex: 1,
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
                    取消
                  </button>
                  <button
                    onClick={onConfirm}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: danger ? 'var(--color-danger)' : 'var(--color-accent)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
