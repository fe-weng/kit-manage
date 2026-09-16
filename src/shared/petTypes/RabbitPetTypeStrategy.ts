import type { AscendIcon } from './IPetTypeStrategy'
import { BasePetTypeStrategy } from './BasePetTypeStrategy'

export class RabbitPetTypeStrategy extends BasePetTypeStrategy {
  readonly type = 'rabbit'
  readonly label = '小兔'
  readonly emoji = '🐰'
  readonly aliases = ['bunny', '兔'] as const
  readonly ascendIcon: AscendIcon = 'flower'
  protected readonly hatchParticles = ['💜', '✨', '🩷', '⭐'] as const
  protected readonly legendParticles = ['💜', '✨', '🌸', '⭐', '💫'] as const
  protected readonly defaultParticles = ['💜', '✨', '🌸'] as const
  protected readonly foods = ['🥕', '🥬', '🍀', '🌸'] as const
}
