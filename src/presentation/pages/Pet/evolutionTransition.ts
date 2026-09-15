import { PetStage } from '@/domain/valueObjects/PetStage'

export const EvolutionKind = {
  HATCH: 'hatch',
  GLOW: 'glow',
  ASCEND: 'ascend',
  LEGEND: 'legend',
} as const

export type EvolutionKind = (typeof EvolutionKind)[keyof typeof EvolutionKind]

export function getEvolutionKind(prev: PetStage, next: PetStage): EvolutionKind {
  if (prev === PetStage.EGG && next === PetStage.HATCHED) return EvolutionKind.HATCH
  if (prev === PetStage.HATCHED && next === PetStage.GROWING) return EvolutionKind.GLOW
  if (prev === PetStage.GROWING && next === PetStage.MATURE) return EvolutionKind.ASCEND
  return EvolutionKind.LEGEND
}

/** 孵化演出的统一节拍，所有内部关键帧都以此为准。 */
export const HATCH_TIMELINE_MS = {
  duration: 1800,
  anticipationEnd: 280,
  impact: 360,
  crackEnd: 500,
  flashEnd: 720,
  shardsEnd: 980,
  settleEnd: 1400,
} as const

export const EVOLUTION_DURATION_MS: Record<EvolutionKind, number> = {
  hatch: HATCH_TIMELINE_MS.duration,
  glow: 2000,
  ascend: 2500,
  legend: 3000,
}

export const EVOLUTION_REVEAL_DELAY_S: Record<EvolutionKind, number> = {
  hatch: HATCH_TIMELINE_MS.impact / 1000,
  glow: 0.7,
  ascend: 0.9,
  legend: 0.7,
}

export const EVOLUTION_TINT: Record<EvolutionKind, string> = {
  hatch: 'rgba(255, 236, 200, 0.55)',
  glow: 'rgba(255, 255, 255, 0.6)',
  ascend: 'rgba(255, 213, 79, 0.5)',
  legend: 'rgba(196, 168, 224, 0.5)',
}

export function getEvolutionParticles(petType: string, kind: EvolutionKind): string[] {
  const chicken = petType !== 'rabbit'
  if (kind === EvolutionKind.HATCH) {
    return chicken ? ['✨', '💛', '🩷', '⭐'] : ['💜', '✨', '🩷', '⭐']
  }
  if (kind === EvolutionKind.LEGEND) {
    return chicken ? ['✨', '⭐', '🌟', '💫', '💛'] : ['💜', '✨', '🌸', '⭐', '💫']
  }
  return chicken ? ['✨', '⭐', '🌟'] : ['💜', '✨', '🌸']
}
