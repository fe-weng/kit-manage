import type { AscendIcon } from './IPetTypeStrategy'
import { BasePetTypeStrategy } from './BasePetTypeStrategy'

export class ChickenPetTypeStrategy extends BasePetTypeStrategy {
  readonly type = 'chicken'
  readonly label = '小鸡'
  readonly emoji = '🐣'
  readonly aliases = ['鸡'] as const
  readonly ascendIcon: AscendIcon = 'crown'
  protected readonly hatchParticles = ['✨', '💛', '🩷', '⭐'] as const
  protected readonly legendParticles = ['✨', '⭐', '🌟', '💫', '💛'] as const
  protected readonly defaultParticles = ['✨', '⭐', '🌟'] as const
}
