import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, Flower } from '@phosphor-icons/react'
import {
  EvolutionKind,
  EVOLUTION_DURATION_MS,
  HATCH_TIMELINE_MS,
  getEvolutionParticles,
} from './evolutionTransition'

interface EvolutionFxProps {
  kind: EvolutionKind
  petType: string
  sizeScale: number
  hitArea: number
  fromSize: number
}

interface Particle {
  id: number
  angle: number
  distance: number
  size: number
  delay: number
  emoji: string
}

function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

function generateParticles(kind: EvolutionKind, petType: string, sizeScale: number): Particle[] {
  const emojis = getEvolutionParticles(resolveShellKey(petType), kind)
  const count = kind === EvolutionKind.LEGEND ? 22 : kind === EvolutionKind.HATCH ? 16 : 12
  const spread = kind === EvolutionKind.LEGEND ? 110 : 90
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + (Math.random() - 0.5) * 24,
    distance: (spread + Math.random() * 50) * sizeScale,
    size: (12 + Math.random() * 10) * Math.max(0.8, sizeScale),
    delay: Math.random() * (kind === EvolutionKind.HATCH ? 0.12 : 0.28),
    emoji: emojis[i % emojis.length] ?? '✨',
  }))
}

const SHELL_SIDES = ['left', 'right', 'top'] as const
type ShellSide = (typeof SHELL_SIDES)[number]

/** 已到位的孵化壳碎片。未登记的种类不播假壳片。 */
const SHELL_SHARD_IMAGES: Record<string, Record<ShellSide, string>> = {
  rabbit: {
    left: withBase('pets/rabbit/evo-shell-left.png'),
    right: withBase('pets/rabbit/evo-shell-right.png'),
    top: withBase('pets/rabbit/evo-shell-top.png'),
  },
  chicken: {
    left: withBase('pets/chicken/evo-shell-left.png'),
    right: withBase('pets/chicken/evo-shell-right.png'),
    top: withBase('pets/chicken/evo-shell-top.png'),
  },
}

function resolveShellKey(petType: string): string {
  const raw = petType.trim()
  const lower = raw.toLowerCase()
  if (lower === 'rabbit' || lower === 'bunny' || raw.includes('兔')) return 'rabbit'
  if (lower === 'chicken' || raw.includes('鸡')) return 'chicken'
  return lower
}

function HatchShards({ petType, fromSize }: { petType: string; fromSize: number }) {
  const art = SHELL_SHARD_IMAGES[resolveShellKey(petType)]
  if (!art) return null

  const impactDelay = HATCH_TIMELINE_MS.impact / 1000
  const flightDuration = (HATCH_TIMELINE_MS.shardsEnd - HATCH_TIMELINE_MS.impact) / 1000
  const shardSize = fromSize * 1.15
  const shards: { side: ShellSide; startX: number; startY: number; x: number; y: number; rotate: number }[] = [
    {
      side: 'left',
      startX: -0.22 * fromSize,
      startY: 0.04 * fromSize,
      x: -1.02 * fromSize,
      y: 0.32 * fromSize,
      rotate: -40,
    },
    {
      side: 'right',
      startX: 0.22 * fromSize,
      startY: 0.04 * fromSize,
      x: 1.02 * fromSize,
      y: 0.32 * fromSize,
      rotate: 40,
    },
    {
      side: 'top',
      startX: 0,
      startY: -0.28 * fromSize,
      x: 0.04 * fromSize,
      y: -1.1 * fromSize,
      rotate: -10,
    },
  ]

  return (
    <>
      {shards.map((shard, i) => (
        <motion.div
          key={shard.side}
          className="absolute pointer-events-none"
          initial={{ x: shard.startX, y: shard.startY, opacity: 0, rotate: 0, scale: 0.96 }}
          animate={{
            x: [shard.startX, shard.startX, shard.x],
            y: [shard.startY, shard.startY, shard.y],
            opacity: [0, 1, 1, 0],
            rotate: [0, 4 * (i === 1 ? 1 : -1), shard.rotate],
            scale: [0.94, 1, 0.86],
          }}
          transition={{
            duration: flightDuration,
            delay: impactDelay,
            times: [0, 0.03, 0.76, 1],
            ease: 'easeOut',
          }}
          style={{
            width: shardSize,
            height: shardSize,
            left: 0,
            top: 0,
            marginLeft: -shardSize / 2,
            marginTop: -shardSize / 2,
          }}
        >
          <img
            src={art[shard.side]}
            alt=""
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </motion.div>
      ))}
    </>
  )
}

export default function EvolutionFx({ kind, petType, sizeScale, hitArea, fromSize }: EvolutionFxProps) {
  const durationS = EVOLUTION_DURATION_MS[kind] / 1000
  const particles = useMemo(
    () => generateParticles(kind, petType, sizeScale),
    [kind, petType, sizeScale],
  )
  const particleDelay =
    kind === EvolutionKind.HATCH
      ? HATCH_TIMELINE_MS.impact / 1000
      : kind === EvolutionKind.ASCEND
        ? 0.7
        : 0.25

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      <div className="absolute left-1/2 top-1/2">
        {kind === EvolutionKind.HATCH && (
          <>
            <motion.svg
              className="absolute pointer-events-none"
              viewBox="0 0 100 100"
              initial={{ opacity: 0, x: '-50%', y: '-50%' }}
              animate={{ opacity: [0, 1, 1, 0], x: '-50%', y: '-50%' }}
              transition={{
                duration: (HATCH_TIMELINE_MS.crackEnd - HATCH_TIMELINE_MS.anticipationEnd) / 1000,
                delay: HATCH_TIMELINE_MS.anticipationEnd / 1000,
                times: [0, 0.35, 0.75, 1],
              }}
              style={{ width: hitArea * 0.72, height: hitArea * 0.72, left: 0, top: 0 }}
            >
              <path d="M42 28 L48 52 L40 70" stroke="#E8C07A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M58 30 L54 48 L62 72" stroke="#E8C07A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M50 22 L51 44" stroke="#FFE9A8" strokeWidth="1.6" fill="none" />
            </motion.svg>
            <motion.div
              className="absolute rounded-full pointer-events-none"
              initial={{ scale: 0.2, opacity: 0, x: '-50%', y: '-50%' }}
              animate={{
                scale: [0.2, 1.05, 1.55],
                opacity: [0, 1, 0],
                x: '-50%',
                y: '-50%',
              }}
              transition={{
                duration: (HATCH_TIMELINE_MS.flashEnd - HATCH_TIMELINE_MS.anticipationEnd) / 1000,
                delay: HATCH_TIMELINE_MS.anticipationEnd / 1000,
                times: [
                  0,
                  (HATCH_TIMELINE_MS.impact - HATCH_TIMELINE_MS.anticipationEnd) /
                    (HATCH_TIMELINE_MS.flashEnd - HATCH_TIMELINE_MS.anticipationEnd),
                  1,
                ],
                ease: 'easeOut',
              }}
              style={{
                width: hitArea * 1.15,
                height: hitArea * 1.15,
                left: 0,
                top: 0,
                background:
                  'radial-gradient(circle, rgba(255,255,255,1) 0 28%, rgba(255,238,176,0.94) 42%, rgba(255,255,255,0) 72%)',
              }}
            />
            <HatchShards petType={petType} fromSize={fromSize} />
          </>
        )}

        {kind === EvolutionKind.GLOW && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            initial={{ scale: 0.4, opacity: 0, x: '-50%', y: '-50%' }}
            animate={{ scale: [0.4, 1.35, 1.8], opacity: [0, 0.85, 0], x: '-50%', y: '-50%' }}
            transition={{ duration: 1.35, ease: 'easeOut' }}
            style={{
              width: hitArea,
              height: hitArea,
              left: 0,
              top: 0,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.45) 42%, transparent 70%)',
            }}
          />
        )}

        {kind === EvolutionKind.ASCEND && (
          <>
            <motion.div
              className="absolute pointer-events-none"
              initial={{ scaleY: 0, opacity: 0, x: '-50%' }}
              animate={{ scaleY: [0, 1, 1, 0.4], opacity: [0, 0.85, 0.7, 0], x: '-50%' }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              style={{
                width: 28 * sizeScale,
                height: hitArea * 1.35,
                left: 0,
                top: -hitArea * 0.95,
                borderRadius: 999,
                transformOrigin: 'bottom center',
                background:
                  'linear-gradient(to top, rgba(255,213,79,0) 0%, rgba(255,213,79,0.65) 40%, rgba(255,255,255,0.9) 100%)',
                filter: 'blur(1px)',
              }}
            />
            <motion.div
              className="absolute pointer-events-none"
              initial={{ y: 12 * sizeScale, scale: 0.4, opacity: 0, x: '-50%' }}
              animate={{ y: -hitArea * 0.28, scale: [0.4, 1.25, 1], opacity: [0, 1, 0], x: '-50%' }}
              transition={{ duration: 1.2, delay: 1.05, ease: 'easeOut' }}
              style={{ left: 0, top: 0 }}
            >
              {petType === 'rabbit' ? (
                <Flower size={28 * sizeScale} weight="fill" color="#C4A8E0" />
              ) : (
                <Crown size={28 * sizeScale} weight="fill" color="#FFD54F" />
              )}
            </motion.div>
          </>
        )}

        {kind === EvolutionKind.LEGEND && (
          <>
            <motion.div
              className="absolute rounded-full pointer-events-none"
              initial={{ scale: 0.5, opacity: 0, x: '-50%', y: '-50%' }}
              animate={{ scale: [0.5, 1.7, 2.2], opacity: [0, 0.7, 0], x: '-50%', y: '-50%' }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              style={{
                width: hitArea * 1.15,
                height: hitArea * 1.15,
                left: 0,
                top: 0,
                background:
                  'radial-gradient(circle, rgba(255,213,79,0.75) 0%, rgba(255,155,176,0.28) 45%, transparent 70%)',
              }}
            />
            <motion.div
              className="absolute pointer-events-none"
              initial={{ scaleX: 0.2, opacity: 0, x: '-50%' }}
              animate={{ scaleX: 1, opacity: [0, 1, 1, 0.4], x: '-50%' }}
              transition={{ duration: 1.6, delay: 0.35, ease: 'easeOut' }}
              style={{
                width: hitArea * 0.95,
                height: 18 * sizeScale,
                left: 0,
                top: hitArea * 0.32,
                borderRadius: '50%',
                transformOrigin: 'center',
                background:
                  'linear-gradient(90deg, #FF9BB0, #FFD54F, #7ECFC0, #A8D8F0, #C4A8E0, #FF9BB0)',
                filter: 'blur(0.5px)',
              }}
            />
          </>
        )}

        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180
          return (
            <motion.span
              key={`evo-${p.id}`}
              className="absolute pointer-events-none"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos(rad) * p.distance,
                y: Math.sin(rad) * p.distance,
                scale: [0, 1.25, 0.55],
                opacity: [1, 1, 0],
                rotate: [0, 160],
              }}
              transition={{
                duration:
                  kind === EvolutionKind.HATCH
                    ? (HATCH_TIMELINE_MS.settleEnd - HATCH_TIMELINE_MS.impact) / 1000 - p.delay
                    : durationS * (kind === EvolutionKind.LEGEND ? 0.55 : 0.5),
                delay: p.delay + particleDelay,
                ease: 'easeOut',
              }}
              style={{ fontSize: `${p.size}px`, lineHeight: 1, left: 0, top: 0 }}
            >
              {p.emoji}
            </motion.span>
          )
        })}
      </div>
    </div>
  )
}
