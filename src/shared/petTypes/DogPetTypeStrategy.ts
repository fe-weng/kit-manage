import type { AscendIcon } from './IPetTypeStrategy'
import { BasePetTypeStrategy } from './BasePetTypeStrategy'

export class DogPetTypeStrategy extends BasePetTypeStrategy {
  readonly type = 'dog'
  readonly label = '小狗'
  readonly emoji = '🐶'
  readonly aliases = ['狗'] as const
  readonly ascendIcon: AscendIcon = 'cloud'
  protected readonly hatchParticles = ['✨', '💙', '☁️', '⭐'] as const
  protected readonly legendParticles = ['✨', '⭐', '☁️', '💫', '💙'] as const
  protected readonly defaultParticles = ['✨', '☁️', '⭐'] as const
}
