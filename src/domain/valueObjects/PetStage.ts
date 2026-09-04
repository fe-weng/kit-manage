export const PetStage = {
  EGG: 1,
  HATCHED: 2,
  GROWING: 3,
  MATURE: 4,
  MAX: 5,
} as const

export type PetStage = (typeof PetStage)[keyof typeof PetStage]

interface PetStageConfig {
  stage: PetStage
  name: string
  requiredExp: number
}

export const PET_STAGE_CONFIGS: readonly PetStageConfig[] = [
  { stage: PetStage.EGG, name: '神秘蛋', requiredExp: 0 },
  { stage: PetStage.HATCHED, name: '刚孵化', requiredExp: 50 },
  { stage: PetStage.GROWING, name: '成长期', requiredExp: 200 },
  { stage: PetStage.MATURE, name: '成熟期', requiredExp: 500 },
  { stage: PetStage.MAX, name: '满级', requiredExp: 1000 },
] as const

export function getStageConfig(stage: PetStage): PetStageConfig {
  const config = PET_STAGE_CONFIGS.find((c) => c.stage === stage)
  if (!config) throw new Error(`Invalid pet stage: ${stage}`)
  return config
}

export function getNextStageConfig(stage: PetStage): PetStageConfig | null {
  if (stage >= PetStage.MAX) return null
  const nextStage = (stage + 1) as PetStage
  return getStageConfig(nextStage)
}
