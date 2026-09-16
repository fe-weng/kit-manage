import { motion } from 'framer-motion'
import { Cookie } from '@phosphor-icons/react'
import type { FeedPoint } from './feedingTransition'
import { FEEDING_TIMELINE_MS, getCookieTossControls, sampleCubicArc } from './feedingTransition'

interface FeedingFxProps {
  start: FeedPoint
  mouth: FeedPoint
}

const COOKIE_SIZE = 44
const T = FEEDING_TIMELINE_MS
const COOKIE_DURATION_S = T.cookieGone / 1000
const PARTICLE_DURATION_S = (T.duration - T.particleStart) / 1000
const ARC_STEPS = 16

export default function FeedingFx({ start, mouth }: FeedingFxProps) {
  const { c1, c2 } = getCookieTossControls(start, mouth)
  const arc = sampleCubicArc(start, c1, c2, mouth, ARC_STEPS)
  const xs = arc.map((p) => p.x)
  const ys = arc.map((p) => p.y)
  const last = arc.length - 1
  const scales = arc.map((_, i) => {
    const t = i / last
    if (t < 0.18) return 0.25 + (t / 0.18) * 0.75
    if (t > 0.78) return 1 - ((t - 0.78) / 0.22) * 0.85
    return 1
  })
  const opacities = arc.map((_, i) => {
    const t = i / last
    if (t < 0.12) return t / 0.12
    if (t > 0.82) return 1 - (t - 0.82) / 0.18
    return 1
  })
  const rotates = arc.map((point, i) => {
    const prev = arc[Math.max(0, i - 1)] ?? point
    const next = arc[Math.min(last, i + 1)] ?? point
    return Math.atan2(next.y - prev.y, next.x - prev.x) * (180 / Math.PI) + i * 12
  })

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-10" aria-hidden="true">
      <motion.div
        className="absolute top-0 left-0"
        initial={{ x: start.x, y: start.y, scale: 0.2, opacity: 0, rotate: 0 }}
        animate={{
          x: xs,
          y: ys,
          scale: scales,
          opacity: opacities,
          rotate: rotates,
        }}
        transition={{ duration: COOKIE_DURATION_S, ease: 'linear' }}
        style={{ width: COOKIE_SIZE, height: COOKIE_SIZE, marginLeft: -COOKIE_SIZE / 2, marginTop: -COOKIE_SIZE / 2 }}
      >
        <div
          className="flex items-center justify-center rounded-full bg-white shadow-clay"
          style={{ width: COOKIE_SIZE, height: COOKIE_SIZE }}
        >
          <Cookie size={28} weight="duotone" color="#E8A054" />
        </div>
      </motion.div>

      {['✨', '⭐', '✨'].map((emoji, i) => (
        <motion.span
          key={emoji + String(i)}
          className="absolute text-[22px]"
          initial={{ x: mouth.x, y: mouth.y, opacity: 0, scale: 0.4 }}
          animate={{
            x: mouth.x + (i - 1) * 26,
            y: mouth.y - 42 - i * 6,
            opacity: [0, 1, 0],
            scale: [0.4, 1.15, 0.85],
          }}
          transition={{
            delay: T.particleStart / 1000 + i * 0.05,
            duration: PARTICLE_DURATION_S,
            ease: 'easeOut',
          }}
          style={{ marginLeft: -11, marginTop: -11 }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  )
}
