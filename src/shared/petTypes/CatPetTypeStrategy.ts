import type { AscendIcon } from './IPetTypeStrategy'
import { BasePetTypeStrategy } from './BasePetTypeStrategy'

export class CatPetTypeStrategy extends BasePetTypeStrategy {
  readonly type = 'cat'
  readonly label = '小猫'
  readonly emoji = '🐱'
  readonly aliases = ['猫'] as const
  readonly ascendIcon: AscendIcon = 'bell'
  protected readonly hatchParticles = ['✨', '❤️', '💛', '⭐'] as const
  protected readonly legendParticles = ['✨', '⭐', '💖', '💫', '💛'] as const
  protected readonly defaultParticles = ['✨', '❤️', '⭐'] as const
  protected readonly foods = ['🐟', '🥛', '🍤', '🧀'] as const
}
