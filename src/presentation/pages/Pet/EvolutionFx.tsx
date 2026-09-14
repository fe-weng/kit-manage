import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, Flower } from '@phosphor-icons/react'
import {
  EvolutionKind,
  EVOLUTION_DURATION_MS,
  getEvolutionParticles,
} from './evolutionTransition'

interface EvolutionFxProps {
  kind: EvolutionKind
  petType: string
  sizeScale: number
  hitArea: number
}

function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

interface Particle {
  id: number
  angle: number
  distance: number
  size: number
  delay: number
  emoji: string
}

function generateParticles(kind: EvolutionKind, petType: string, sizeScale: number): Particle[] {
  const emojis = getEvolutionParticles(petType, kind)
  const count = kind === EvolutionKind.LEGEND ? 22 : kind === EvolutionKind.HATCH ? 16 : 12
  const spread = kind === EvolutionKind.LEGEND ? 110 : 90
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + (Math.random() - 0.5) * 24,
    distance: (spread + Math.random() * 50) * sizeScale,
    size: 12 + Math.random() * 10,
    delay: Math.random() * 0.28,
    emoji: emojis[i % emojis.length] ?? '✨',
  }))
}

const CONFETTI_COLORS = ['#FF9BB0', '#FFD54F', '#7ECFC0', '#C4A8E0', '#FFB74D']

const SHELL_SIDES = ['left', 'right', 'top'] as const
type ShellSide = (typeof SHELL_SIDES)[number]

/** 已到位的孵化壳碎片。小鸡仍走几何占位，等素材后再登记。 */
const SHELL_SHARD_IMAGES: Record<string, Record<ShellSide, string>> = {
  rabbit: {
    left: 'pets/rabbit/evo-shell-left.png',
    right: 'pets/rabbit/evo-shell-right.png',
    top: 'pets/rabbit/evo-shell-top.png',
  },
}

function HatchShards({ petType, sizeScale }: { petType: string; sizeScale: number }) {
  const art = SHELL_SHARD_IMAGES[petType]
  const shardSize = (art ? 168 : 72) * sizeScale
  const placeholderBg =
    petType === 'rabbit'
      ? 'radial-gradient(circle at 36% 32%, #FFFFFF 0 5px, transparent 6px), #C4A8E0'
      : 'radial-gradient(circle at 30% 28%, #FFE08A 0 6px, transparent 7px), #F7C9D0'

  const shards: { side: ShellSide; x: number; y: number; rotate: number }[] = [
    { side: 'left', x: -110 * sizeScale, y: -24 * sizeScale, rotate: -38 },
    { side: 'right', x: 110 * sizeScale, y: 12 * sizeScale, rotate: 42 },
    { side: 'top', x: 8 * sizeScale, y: -130 * sizeScale, rotate: -12 },
  ]

  return (
    <>
      {shards.map((shard, i) => (
        <motion.div
          key={shard.side}
          className="absolute pointer-events-none"
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: shard.x,
            y: shard.y,
            opacity: [1, 1, 0],
            rotate: shard.rotate,
            scale: [1, 1.05, 0.85],
          }}
          transition={{ duration: 1.1, delay: 0.35 + i * 0.04, ease: 'easeOut' }}
          style={{
            width: shardSize,
            height: shardSize,
            left: 0,
            top: 0,
            marginLeft: -shardSize / 2,
            marginTop: -shardSize / 2,
          }}
        >
          {art ? (
            <img
              src={withBase(art[shard.side])}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: shard.side === 'top' ? '50% 50% 40% 40%' : '46%',
                background: placeholderBg,
                boxShadow: '2px 3px 0 rgba(255,255,255,0.35) inset, 0 4px 10px rgba(0,0,0,0.08)',
                clipPath:
                  shard.side === 'left'
                    ? 'polygon(8% 10%, 72% 0%, 58% 100%, 0% 88%)'
                    : shard.side === 'right'
                      ? 'polygon(28% 4%, 100% 18%, 92% 92%, 18% 100%)'
                      : 'polygon(18% 8%, 82% 8%, 70% 78%, 30% 78%)',
              }}
            />
          )}
        </motion.div>
      ))}
    </>
  )
}

export default function EvolutionFx({ kind, petType, sizeScale, hitArea }: EvolutionFxProps) {
  const durationS = EVOLUTION_DURATION_MS[kind] / 1000
  const particles = useMemo(
    () => generateParticles(kind, petType, sizeScale),
    [kind, petType, sizeScale],
  )
  const particleDelay = kind === EvolutionKind.HATCH ? 0.45 : kind === EvolutionKind.ASCEND ? 0.7 : 0.25
  const confetti = useMemo(
    () =>
      kind === EvolutionKind.HATCH
        ? Array.from({ length: 18 }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 220 * sizeScale,
            y: (Math.random() * 160 + 40) * sizeScale,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
            delay: 0.4 + Math.random() * 0.2,
            w: 6 + Math.random() * 5,
            h: 10 + Math.random() * 8,
            rot: (Math.random() - 0.5) * 220,
          }))
        : [],
    [kind, sizeScale],
  )

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
              transition={{ duration: 0.7, times: [0, 0.25, 0.7, 1] }}
              style={{ width: hitArea * 0.72, height: hitArea * 0.72, left: 0, top: 0 }}
            >
              <path d="M42 28 L48 52 L40 70" stroke="#E8C07A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M58 30 L54 48 L62 72" stroke="#E8C07A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M50 22 L51 44" stroke="#FFE9A8" strokeWidth="1.6" fill="none" />
            </motion.svg>
            <HatchShards petType={petType} sizeScale={sizeScale} />
            {confetti.map((c) => (
              <motion.span
                key={`paper-${c.id}`}
                className="absolute pointer-events-none"
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                animate={{ x: c.x, y: c.y, opacity: [1, 1, 0], rotate: c.rot, scale: [1, 1.1, 0.6] }}
                transition={{ duration: 1.15, delay: c.delay, ease: 'easeOut' }}
                style={{
                  width: c.w,
                  height: c.h,
                  borderRadius: 2,
                  backgroundColor: c.color,
                  left: 0,
                  top: 0,
                }}
              />
            ))}
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
                duration: durationS * (kind === EvolutionKind.LEGEND ? 0.55 : 0.5),
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
