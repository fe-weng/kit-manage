import { PetStage } from '@/domain/valueObjects/PetStage'
import type {
  AscendIcon,
  IPetTypeStrategy,
  PetEvolutionFxKind,
  ShellSide,
} from './IPetTypeStrategy'

const STAGE_FILES: Record<PetStage, string> = {
  [PetStage.EGG]: 'stage-1-egg.png',
  [PetStage.HATCHED]: 'stage-2-hatched.png',
  [PetStage.GROWING]: 'stage-3-growing.png',
  [PetStage.MATURE]: 'stage-4-mature.png',
  [PetStage.MAX]: 'stage-5-max.png',
}

export abstract class BasePetTypeStrategy implements IPetTypeStrategy {
  abstract readonly type: string
  abstract readonly label: string
  abstract readonly emoji: string
  abstract readonly aliases: readonly string[]
  abstract readonly ascendIcon: AscendIcon
  protected abstract readonly hatchParticles: readonly string[]
  protected abstract readonly legendParticles: readonly string[]
  protected abstract readonly defaultParticles: readonly string[]
  protected abstract readonly foods: readonly string[]

  matches(petType: string): boolean {
    const raw = petType.trim()
    const lower = raw.toLowerCase()
    return (
      this.type === lower ||
      this.aliases.some((alias) => lower === alias.toLowerCase() || raw.includes(alias))
    )
  }

  particlesFor(kind: PetEvolutionFxKind): string[] {
    if (kind === 'hatch') return [...this.hatchParticles]
    if (kind === 'legend') return [...this.legendParticles]
    return [...this.defaultParticles]
  }

  feedFoods(): readonly string[] {
    return this.foods
  }

  stageImage(stage: PetStage): string {
    const file = STAGE_FILES[stage] ?? STAGE_FILES[PetStage.GROWING]
    return `pets/${this.type}/${file}`
  }

  shellImages(): Record<ShellSide, string> | null {
    return {
      left: `pets/${this.type}/evo-shell-left.png`,
      right: `pets/${this.type}/evo-shell-right.png`,
      top: `pets/${this.type}/evo-shell-top.png`,
    }
  }
}
