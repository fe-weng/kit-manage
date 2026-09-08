import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BaseModalProps {
  visible: boolean
  onClose: () => void
  titleId?: string
  zIndex?: number
  dialogClassName?: string
  dialogStyle?: CSSProperties
  children: ReactNode
}

export default function BaseModal({
  visible,
  onClose,
  titleId,
  zIndex = 100,
  dialogClassName,
  dialogStyle,
  children,
}: BaseModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [visible, onClose])

  useEffect(() => {
    if (visible) {
      previousFocusRef.current = document.activeElement as HTMLElement
      requestAnimationFrame(() => dialogRef.current?.focus())
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const dialog = dialogRef.current
    if (!dialog) return

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40"
            style={{ zIndex }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: zIndex + 1, padding: '0 24px' }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              {...(titleId ? { 'aria-labelledby': titleId } : {})}
              tabIndex={-1}
              className={`pointer-events-auto w-full focus:outline-none ${dialogClassName ?? ''}`}
              style={dialogStyle}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
