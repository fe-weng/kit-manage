import type { PetStage } from '@/domain/valueObjects/PetStage'

export type PetEvolutionFxKind = 'hatch' | 'glow' | 'ascend' | 'legend'

export type AscendIcon = 'crown' | 'flower' | 'bell' | 'cloud'

export type ShellSide = 'left' | 'right' | 'top'

export interface IPetTypeStrategy {
  readonly type: string
  readonly label: string
  readonly emoji: string
  readonly aliases: readonly string[]
  readonly ascendIcon: AscendIcon
  matches(petType: string): boolean
  particlesFor(kind: PetEvolutionFxKind): string[]
  stageImage(stage: PetStage): string
  shellImages(): Record<ShellSide, string> | null
}
