export type PetCatalogType = 'chicken' | 'rabbit' | 'cat' | 'dog'

export type AscendIcon = 'crown' | 'flower' | 'bell' | 'cloud'

export interface PetCatalogEntry {
  type: PetCatalogType
  label: string
  emoji: string
  aliases: string[]
  hatchParticles: string[]
  legendParticles: string[]
  defaultParticles: string[]
  ascendIcon: AscendIcon
}

export const PET_CATALOG: readonly PetCatalogEntry[] = [
  {
    type: 'chicken',
    label: '小鸡',
    emoji: '🐣',
    aliases: ['鸡'],
    hatchParticles: ['✨', '💛', '🩷', '⭐'],
    legendParticles: ['✨', '⭐', '🌟', '💫', '💛'],
    defaultParticles: ['✨', '⭐', '🌟'],
    ascendIcon: 'crown',
  },
  {
    type: 'rabbit',
    label: '小兔',
    emoji: '🐰',
    aliases: ['bunny', '兔'],
    hatchParticles: ['💜', '✨', '🩷', '⭐'],
    legendParticles: ['💜', '✨', '🌸', '⭐', '💫'],
    defaultParticles: ['💜', '✨', '🌸'],
    ascendIcon: 'flower',
  },
  {
    type: 'cat',
    label: '小猫',
    emoji: '🐱',
    aliases: ['猫'],
    hatchParticles: ['✨', '❤️', '💛', '⭐'],
    legendParticles: ['✨', '⭐', '💖', '💫', '💛'],
    defaultParticles: ['✨', '❤️', '⭐'],
    ascendIcon: 'bell',
  },
  {
    type: 'dog',
    label: '小狗',
    emoji: '🐶',
    aliases: ['狗'],
    hatchParticles: ['✨', '💙', '☁️', '⭐'],
    legendParticles: ['✨', '⭐', '☁️', '💫', '💙'],
    defaultParticles: ['✨', '☁️', '⭐'],
    ascendIcon: 'cloud',
  },
]

export const ADOPTABLE_PET_TYPES = PET_CATALOG.map(({ type, label }) => ({ type, label }))

export function resolvePetCatalog(petType: string): PetCatalogEntry | undefined {
  const raw = petType.trim()
  const lower = raw.toLowerCase()
  return PET_CATALOG.find(
    (entry) =>
      entry.type === lower ||
      entry.aliases.some((alias) => lower === alias.toLowerCase() || raw.includes(alias)),
  )
}

export function isAdoptablePetType(type: string): boolean {
  return PET_CATALOG.some((entry) => entry.type === type)
}

export function getPetEmoji(petType: string): string {
  return resolvePetCatalog(petType)?.emoji ?? '🐣'
}
