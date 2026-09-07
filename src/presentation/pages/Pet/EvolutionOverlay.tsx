import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EvolutionOverlayProps {
  visible: boolean
  onDone: () => void
}

const EVO_TOTAL_DURATION = 2500

export default function EvolutionOverlay({ visible, onDone }: EvolutionOverlayProps) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => onDoneRef.current(), EVO_TOTAL_DURATION)
      return () => clearTimeout(timer)
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200]"
          onClick={onDone}
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
            animate={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
            exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
