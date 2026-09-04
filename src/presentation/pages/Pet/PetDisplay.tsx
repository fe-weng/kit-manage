import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown } from '@phosphor-icons/react'
import { PetStage } from '@/domain/valueObjects/PetStage'

interface PetDisplayProps {
  stage: PetStage
  name: string
  petType: string
  onPet: () => void
  evolving?: boolean
  prevStage?: PetStage
}

const PET_IMAGES: Record<string, Partial<Record<PetStage, string>>> = {
  chicken: {
    [PetStage.EGG]: '/pets/chicken/stage-1-egg.png',
    [PetStage.HATCHED]: '/pets/chicken/stage-2-hatched.png',
    [PetStage.GROWING]: '/pets/chicken/stage-3-growing.png',
    [PetStage.MATURE]: '/pets/chicken/stage-2-hatched.png',
    [PetStage.MAX]: '/pets/chicken/stage-3-growing.png',
  },
  rabbit: {
    [PetStage.GROWING]: '/pets/rabbit/stage-3-growing.png',
  },
}

export function getPetImage(petType: string, stage: PetStage): string {
  const typeImages = PET_IMAGES[petType]
  if (typeImages?.[stage]) return typeImages[stage]!
  if (typeImages?.[PetStage.GROWING]) return typeImages[PetStage.GROWING]!
  return '/pets/chicken/stage-3-growing.png'
}

const STAGE_SIZES: Record<PetStage, number> = {
  [PetStage.EGG]: 120,
  [PetStage.HATCHED]: 130,
  [PetStage.GROWING]: 140,
  [PetStage.MATURE]: 150,
  [PetStage.MAX]: 160,
}

// ── Evolution particles ──
const EVO_PARTICLE_COUNT = 14
const EVO_DURATION = 2.2
const EVO_EMOJIS = ['✨', '⭐', '🌟', '💫', '⭐']

interface EvoParticle {
  id: number
  angle: number
  distance: number
  size: number
  delay: number
  emoji: string
}

function generateEvoParticles(): EvoParticle[] {
  return Array.from({ length: EVO_PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (360 / EVO_PARTICLE_COUNT) * i + (Math.random() - 0.5) * 20,
    distance: 80 + Math.random() * 60,
    size: 14 + Math.random() * 12,
    delay: Math.random() * 0.25,
    emoji: EVO_EMOJIS[i % EVO_EMOJIS.length] ?? '✨',
  }))
}

export default function PetDisplay({ stage, name, petType, onPet, evolving = false, prevStage }: PetDisplayProps) {
  const [hearts, setHearts] = useState<number[]>([])
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const imageSize = STAGE_SIZES[stage] || STAGE_SIZES[PetStage.EGG]
  const evoParticles = useMemo(() => (evolving ? generateEvoParticles() : []), [evolving])

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout) }
  }, [])

  const handlePet = () => {
    if (evolving) return
    onPet()
    const id = Date.now()
    setHearts((prev) => [...prev, id])
    const timer = setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h !== id))
      timersRef.current.delete(timer)
    }, 1200)
    timersRef.current.add(timer)
  }

  const showOldImage = evolving && prevStage != null && prevStage !== stage

  return (
    <div className="flex flex-col items-center" style={{ gap: '12px' }}>
      {/* Pet Name */}
      <div className="flex items-center" style={{ gap: '8px' }}>
        <span className="text-[14px]">{petType === 'rabbit' ? '🐰' : '🐣'}</span>
        <h2 className="text-[18px] font-bold text-text-main">{name}</h2>
        {stage === PetStage.MAX && (
          <Crown size={18} weight="fill" className="text-pet-gold" />
        )}
      </div>

      {/* Pet Area */}
      <motion.button
        onClick={handlePet}
        whileTap={evolving ? undefined : { scale: 0.92 }}
        className="relative w-48 h-48 bg-card rounded-full shadow-clay flex items-center justify-center cursor-pointer overflow-visible"
      >
        {/* Evolution glow — golden ring pulsing from pet center */}
        <AnimatePresence>
          {evolving && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ boxShadow: '0 0 0px 0px rgba(255,215,0,0)' }}
                animate={{
                  boxShadow: [
                    '0 0 0px 0px rgba(255,215,0,0)',
                    '0 0 40px 20px rgba(255,215,0,0.6)',
                    '0 0 60px 30px rgba(255,215,0,0.3)',
                    '0 0 20px 10px rgba(255,215,0,0)',
                  ],
                }}
                exit={{ boxShadow: '0 0 0px 0px rgba(255,215,0,0)' }}
                transition={{ duration: EVO_DURATION * 0.8, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute rounded-full pointer-events-none"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.6, 2], opacity: [0, 0.5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: EVO_DURATION * 0.7, ease: 'easeOut' }}
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,165,0,0.2) 50%, transparent 70%)',
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Pet Image — with evolution crossfade */}
        <motion.div
          animate={evolving ? { y: 0 } : { y: [0, -6, 0] }}
          transition={evolving ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            {showOldImage ? (
              <motion.img
                key={`old-${prevStage}`}
                src={getPetImage(petType, prevStage)}
                alt={name}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.4 }}
                style={{ width: imageSize, height: imageSize, objectFit: 'contain', pointerEvents: 'none' }}
                draggable={false}
              />
            ) : (
              <motion.img
                key={`new-${stage}`}
                src={getPetImage(petType, stage)}
                alt={name}
                initial={evolving ? { opacity: 0, scale: 1.3 } : { opacity: 1, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: evolving ? 0.3 : 0 }}
                style={{ width: imageSize, height: imageSize, objectFit: 'contain', pointerEvents: 'none' }}
                draggable={false}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Evolution particles — fly out from pet center */}
        <AnimatePresence>
          {evolving && evoParticles.map((p) => {
            const rad = (p.angle * Math.PI) / 180
            const tx = Math.cos(rad) * p.distance
            const ty = Math.sin(rad) * p.distance
            return (
              <motion.span
                key={`evo-${p.id}`}
                className="absolute pointer-events-none"
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x: tx, y: ty, scale: [0, 1.3, 0.6], opacity: [1, 1, 0], rotate: [0, 180 + Math.random() * 180] }}
                exit={{ opacity: 0 }}
                transition={{ duration: EVO_DURATION * 0.6, delay: p.delay + 0.3, ease: 'easeOut' }}
                style={{ fontSize: `${p.size}px`, lineHeight: 1 }}
              >
                {p.emoji}
              </motion.span>
            )
          })}
        </AnimatePresence>

        {/* Hearts Animation (normal interaction) */}
        <AnimatePresence>
          {!evolving && hearts.map((id) => (
            <motion.span
              key={id}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -60, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute text-[28px] pointer-events-none"
              style={{ left: `${40 + Math.random() * 40}%`, top: '10%' }}
            >
              ❤️
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Tap hint (hidden during evolution) */}
        {!evolving && (
          <span className="absolute bottom-3 text-[11px] text-text-sub/60">
            点击抚摸
          </span>
        )}
      </motion.button>
    </div>
  )
}
