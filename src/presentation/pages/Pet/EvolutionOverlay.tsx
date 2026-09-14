import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EVOLUTION_DURATION_MS, EVOLUTION_TINT, type EvolutionKind } from './evolutionTransition'

interface EvolutionOverlayProps {
  visible: boolean
  kind: EvolutionKind | null
  onDone: () => void
}

export default function EvolutionOverlay({ visible, kind, onDone }: EvolutionOverlayProps) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const durationMs = kind ? EVOLUTION_DURATION_MS[kind] : 2500
  const tint = kind ? EVOLUTION_TINT[kind] : 'rgba(0,0,0,0.15)'

  useEffect(() => {
    if (!visible || !kind) return
    const timer = setTimeout(() => onDoneRef.current(), durationMs)
    return () => clearTimeout(timer)
  }, [visible, kind, durationMs])

  return (
    <AnimatePresence>
      {visible && kind && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200]"
          aria-hidden="true"
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: `radial-gradient(circle at 50% 42%, transparent 0 18%, ${tint} 72%)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
