import { useState, useRef, useEffect } from 'react'
import type { Ref } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown } from '@phosphor-icons/react'
import { PetStage } from '@/domain/valueObjects/PetStage'
import { getPetEmoji, resolvePetTypeStrategy } from '@/shared/petTypes'
import EvolutionFx from './EvolutionFx'
import {
  EvolutionKind,
  EVOLUTION_REVEAL_DELAY_S,
  type EvolutionKind as EvolutionKindType,
} from './evolutionTransition'
import {
  FEEDING_NOD_DURATION_S,
  FEEDING_NOD_ORIGIN,
  FEEDING_NOD_PERSPECTIVE,
  FEEDING_NOD_ROTATE_X,
  FEEDING_NOD_TIMES,
} from './feedingTransition'

interface PetDisplayProps {
  stage: PetStage
  name: string
  petType: string
  onPet: () => void
  evolving?: boolean
  eating?: boolean
  prevStage?: PetStage
  evolutionKind?: EvolutionKindType | null
  hitAreaRef?: Ref<HTMLDivElement>
}

function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

export function getPetImage(petType: string, stage: PetStage): string {
  return withBase(resolvePetTypeStrategy(petType).stageImage(stage))
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
    return {
      x: [0, -5, 5, -4, 4, 0],
      rotate: [0, -4, 4, -3, 3, 0],
      opacity: 1,
      scale: [1, 1.04],
    }
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
  if (kind === EvolutionKind.HATCH) return { duration: 0.28, ease: 'easeInOut' as const }
  if (kind === EvolutionKind.ASCEND) return { duration: 0.85, ease: 'easeInOut' as const }
  return { duration: 0.55 }
}

function newImageInitial(kind: EvolutionKindType | null, evolving: boolean) {
  if (!evolving || !kind) return { opacity: 1, scale: 1, y: 0 }
  if (kind === EvolutionKind.HATCH) return { opacity: 0, scale: 0.55, y: 18 }
  if (kind === EvolutionKind.LEGEND) return { opacity: 0, scale: 1.35, y: 0 }
  return { opacity: 0, scale: 1.15, y: 0 }
}

function newImageAnimate(kind: EvolutionKindType | null, evolving: boolean) {
  if (evolving && kind === EvolutionKind.HATCH) {
    return {
      opacity: [0, 1, 1],
      scale: [0.55, 1.06, 1],
      y: [18, -2, 0],
      rotate: 0,
    }
  }
  return { opacity: 1, scale: 1, y: 0, rotate: 0 }
}

function newImageTransition(kind: EvolutionKindType | null) {
  if (kind === EvolutionKind.HATCH) {
    return { duration: 0.59, times: [0, 0.7, 1], ease: 'easeOut' as const }
  }
  return { duration: 0.55, ease: 'easeOut' as const }
}

function petBodyAnimate(evolving: boolean, eating: boolean, sizeScale: number) {
  if (evolving) return { y: 0, rotateX: 0 }
  if (eating) {
    return {
      y: 0,
      rotateX: [...FEEDING_NOD_ROTATE_X],
    }
  }
  return { y: [0, -6 * sizeScale, 0], rotateX: 0 }
}

function petBodyTransition(evolving: boolean, eating: boolean) {
  if (evolving) return { duration: 0.3 }
  if (eating) {
    return {
      y: { duration: 0.25, ease: 'easeOut' as const },
      rotateX: {
        duration: FEEDING_NOD_DURATION_S,
        times: [...FEEDING_NOD_TIMES],
        ease: 'easeInOut' as const,
      },
    }
  }
  return { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
}

export default function PetDisplay({
  stage,
  name,
  petType,
  onPet,
  evolving = false,
  eating = false,
  prevStage,
  evolutionKind = null,
  hitAreaRef,
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
  const oldImageSize = prevStage != null ? sizeMap[prevStage] : imageSize

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
    if (evolving || eating) return
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
        <span className="text-[14px]">{getPetEmoji(petType)}</span>
        <h2 className="text-[18px] font-bold text-text-main">{name}</h2>
        {stage === PetStage.MAX && (
          <Crown size={18} weight="fill" className="text-pet-gold" />
        )}
      </div>

      <div
        ref={hitAreaRef}
        className="relative rounded-full flex items-center justify-center overflow-visible"
        style={{ width: hitArea, height: hitArea, perspective: FEEDING_NOD_PERSPECTIVE }}
      >
      <motion.button
        onClick={handlePet}
        whileTap={evolving || eating ? undefined : { scale: 0.92 }}
        aria-label={`抚摸${name}`}
        className="relative rounded-full flex items-center justify-center cursor-pointer overflow-visible"
        style={{ width: hitArea, height: hitArea, transformStyle: 'preserve-3d' }}
      >
        <motion.div
          key={evolving ? 'evolving' : 'pet-body'}
          className="relative flex items-center justify-center"
          animate={petBodyAnimate(evolving, eating, sizeScale)}
          transition={petBodyTransition(evolving, eating)}
          style={{
            width: imageSize,
            height: imageSize,
            transformOrigin: FEEDING_NOD_ORIGIN,
            transformStyle: 'preserve-3d',
          }}
        >
          <AnimatePresence mode={kind === EvolutionKind.HATCH ? 'sync' : 'wait'}>
            {showOldImage ? (
              <motion.img
                key={`old-${prevStage}`}
                src={getPetImage(petType, prevStage)}
                alt={name}
                initial={{ opacity: 1, scale: 1, rotate: 0 }}
                animate={oldImageAnimate(kind)}
                exit={{
                  opacity: 0,
                  scale: kind === EvolutionKind.HATCH ? 1.04 : 0.8,
                  transition: kind === EvolutionKind.HATCH
                    ? { duration: 0.08, ease: 'easeOut' }
                    : undefined,
                }}
                transition={oldImageTransition(kind)}
                style={{
                  position: 'absolute',
                  width: oldImageSize,
                  height: oldImageSize,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
                draggable={false}
              />
            ) : (
              <motion.img
                key={`new-${stage}`}
                src={getPetImage(petType, stage)}
                alt={name}
                initial={newImageInitial(kind, evolving)}
                animate={newImageAnimate(kind, evolving)}
                transition={newImageTransition(kind)}
                style={{
                  position: 'absolute',
                  width: imageSize,
                  height: imageSize,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
                draggable={false}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {kind && (
          <EvolutionFx
            kind={kind}
            petType={petType}
            sizeScale={sizeScale}
            hitArea={hitArea}
            fromSize={prevStage != null ? sizeMap[prevStage] : imageSize}
          />
        )}

        <AnimatePresence>
          {!evolving && !eating && hearts.map((id) => (
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
      </motion.button>
      </div>
    </div>
  )
}
