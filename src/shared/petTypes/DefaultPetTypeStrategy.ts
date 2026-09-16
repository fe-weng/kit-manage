import { PetStage } from '@/domain/valueObjects/PetStage'
import type { AscendIcon, ShellSide } from './IPetTypeStrategy'
import { BasePetTypeStrategy } from './BasePetTypeStrategy'

/** 未知种类兜底：走小鸡素材，不进入图鉴，不播壳片。 */
export class DefaultPetTypeStrategy extends BasePetTypeStrategy {
  readonly type = 'chicken'
  readonly label = '宠物'
  readonly emoji = '🐣'
  readonly aliases: readonly string[] = []
  readonly ascendIcon: AscendIcon = 'crown'
  protected readonly hatchParticles = ['✨', '💛', '🩷', '⭐'] as const
  protected readonly legendParticles = ['✨', '⭐', '🌟', '💫', '💛'] as const
  protected readonly defaultParticles = ['✨', '⭐', '🌟'] as const

  matches(_petType: string): boolean {
    return false
  }

  stageImage(_stage: PetStage): string {
    return 'pets/chicken/stage-3-growing.png'
  }

  shellImages(): Record<ShellSide, string> | null {
    return null
  }
}
