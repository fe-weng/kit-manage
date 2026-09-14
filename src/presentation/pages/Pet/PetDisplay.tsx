import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown } from '@phosphor-icons/react'
import { PetStage } from '@/domain/valueObjects/PetStage'
import EvolutionFx from './EvolutionFx'
import {
  EvolutionKind,
  EVOLUTION_REVEAL_DELAY_S,
  type EvolutionKind as EvolutionKindType,
} from './evolutionTransition'

interface PetDisplayProps {
  stage: PetStage
  name: string
  petType: string
  onPet: () => void
  evolving?: boolean
  prevStage?: PetStage
  evolutionKind?: EvolutionKindType | null
}

function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

const PET_IMAGES: Record<string, Partial<Record<PetStage, string>>> = {
  chicken: {
    [PetStage.EGG]: 'pets/chicken/stage-1-egg.png',
    [PetStage.HATCHED]: 'pets/chicken/stage-2-hatched.png',
    [PetStage.GROWING]: 'pets/chicken/stage-3-growing.png',
    [PetStage.MATURE]: 'pets/chicken/stage-4-mature.png',
    [PetStage.MAX]: 'pets/chicken/stage-5-max.png',
  },
  rabbit: {
    [PetStage.EGG]: 'pets/rabbit/stage-1-egg.png',
    [PetStage.HATCHED]: 'pets/rabbit/stage-2-hatched.png',
    [PetStage.GROWING]: 'pets/rabbit/stage-3-growing.png',
    [PetStage.MATURE]: 'pets/rabbit/stage-4-mature.png',
    [PetStage.MAX]: 'pets/rabbit/stage-5-max.png',
  },
}

export function getPetImage(petType: string, stage: PetStage): string {
  const typeImages = PET_IMAGES[petType]
  if (typeImages?.[stage]) return withBase(typeImages[stage]!)
  if (typeImages?.[PetStage.GROWING]) return withBase(typeImages[PetStage.GROWING]!)
  return withBase('pets/chicken/stage-3-growing.png')
}

/** 手机端维持原尺寸；平板竖屏走方案 C（满级 400） */
const STAGE_SIZES_PHONE: Record<PetStage, number> = {
  [PetStage.EGG]: 120,
  [PetStage.HATCHED]: 130,
  [PetStage.GROWING]: 140,
  [PetStage.MATURE]: 150,
  [PetStage.MAX]: 160,
}

const STAGE_SIZES_TABLET: Record<PetStage, number> = {
  [PetStage.EGG]: 300,
  [PetStage.HATCHED]: 325,
  [PetStage.GROWING]: 350,
  [PetStage.MATURE]: 375,
  [PetStage.MAX]: 400,
}

/** 覆盖 iPad Mini（744）及更大平板，避开手机竖屏（≤430） */
const TABLET_MIN_WIDTH = 700

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(() =>
    window.matchMedia(`(min-width: ${TABLET_MIN_WIDTH}px)`).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${TABLET_MIN_WIDTH}px)`)
    const onChange = () => setIsTablet(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isTablet
}

function oldImageAnimate(kind: EvolutionKindType | null) {
  if (kind === EvolutionKind.HATCH) {
    return { x: [0, -5, 5, -4, 4, 0], rotate: [0, -4, 4, -3, 3, 0], opacity: 1, scale: 1 }
  }
  if (kind === EvolutionKind.GLOW) {
    return { opacity: 1, scale: [1, 1.04, 1], filter: ['brightness(1)', 'brightness(1.8)', 'brightness(1.4)'] }
  }
  if (kind === EvolutionKind.ASCEND) {
    return { rotate: [0, 12, -8, 360], scale: [1, 0.92, 0.92, 1], opacity: 1 }
  }
  if (kind === EvolutionKind.LEGEND) {
    return { scale: [1, 1.12, 1.2], opacity: 1 }
  }
  return { opacity: 1, scale: 1 }
}

function oldImageTransition(kind: EvolutionKindType | null) {
  if (kind === EvolutionKind.HATCH) return { duration: 0.45, ease: 'easeInOut' as const }
  if (kind === EvolutionKind.ASCEND) return { duration: 0.85, ease: 'easeInOut' as const }
  return { duration: 0.55 }
}

function newImageInitial(kind: EvolutionKindType | null, evolving: boolean) {
  if (!evolving || !kind) return { opacity: 1, scale: 1, y: 0 }
  if (kind === EvolutionKind.HATCH) return { opacity: 0, scale: 0.2, y: 18 }
  if (kind === EvolutionKind.LEGEND) return { opacity: 0, scale: 1.35, y: 0 }
  return { opacity: 0, scale: 1.15, y: 0 }
}

export default function PetDisplay({
  stage,
  name,
  petType,
  onPet,
  evolving = false,
  prevStage,
  evolutionKind = null,
}: PetDisplayProps) {
  const [hearts, setHearts] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const isTablet = useIsTablet()
  const sizeMap = isTablet ? STAGE_SIZES_TABLET : STAGE_SIZES_PHONE
  const imageSize = sizeMap[stage] || sizeMap[PetStage.EGG]
  const hitArea = imageSize + 40
  const sizeScale = imageSize / STAGE_SIZES_PHONE[PetStage.MAX]
  const kind = evolving ? (evolutionKind ?? EvolutionKind.GLOW) : null

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout) }
  }, [])

  useEffect(() => {
    if (!evolving || !kind) {
      setRevealed(false)
      return
    }
    const timer = setTimeout(() => setRevealed(true), EVOLUTION_REVEAL_DELAY_S[kind] * 1000)
    return () => clearTimeout(timer)
  }, [evolving, kind])

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

  const showOldImage = evolving && prevStage != null && prevStage !== stage && !revealed

  return (
    <div className="flex flex-col items-center" style={{ gap: '12px' }}>
      <div className="flex items-center" style={{ gap: '8px' }}>
        <span className="text-[14px]">{petType === 'rabbit' ? '🐰' : '🐣'}</span>
        <h2 className="text-[18px] font-bold text-text-main">{name}</h2>
        {stage === PetStage.MAX && (
          <Crown size={18} weight="fill" className="text-pet-gold" />
        )}
      </div>

      <motion.button
        onClick={handlePet}
        whileTap={evolving ? undefined : { scale: 0.92 }}
        className="relative rounded-full flex items-center justify-center cursor-pointer overflow-visible"
        style={{ width: hitArea, height: hitArea }}
      >
        <motion.div
          animate={evolving ? { y: 0 } : { y: [0, -6 * sizeScale, 0] }}
          transition={evolving ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            {showOldImage ? (
              <motion.img
                key={`old-${prevStage}`}
                src={getPetImage(petType, prevStage)}
                alt={name}
                initial={{ opacity: 1, scale: 1, rotate: 0 }}
                animate={oldImageAnimate(kind)}
                exit={{ opacity: 0, scale: kind === EvolutionKind.HATCH ? 0.55 : 0.8 }}
                transition={oldImageTransition(kind)}
                style={{ width: imageSize, height: imageSize, objectFit: 'contain', pointerEvents: 'none' }}
                draggable={false}
              />
            ) : (
              <motion.img
                key={`new-${stage}`}
                src={getPetImage(petType, stage)}
                alt={name}
                initial={newImageInitial(kind, evolving)}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                transition={{
                  duration: kind === EvolutionKind.HATCH ? 0.7 : 0.55,
                  ease: 'easeOut',
                }}
                style={{ width: imageSize, height: imageSize, objectFit: 'contain', pointerEvents: 'none' }}
                draggable={false}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {kind && (
          <EvolutionFx kind={kind} petType={petType} sizeScale={sizeScale} hitArea={hitArea} />
        )}

        <AnimatePresence>
          {!evolving && hearts.map((id) => (
            <motion.span
              key={id}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -60 * sizeScale, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute text-[28px] pointer-events-none"
              style={{ left: `${40 + Math.random() * 40}%`, top: '10%' }}
            >
              ❤️
            </motion.span>
          ))}
        </AnimatePresence>

        {!evolving && (
          <span className="absolute bottom-3 text-[11px] text-text-sub/60">
            点击抚摸
          </span>
        )}
      </motion.button>
    </div>
  )
}
