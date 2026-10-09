/**
 * 同时具备 young 与 grown 身体包的物种。
 * 清单为空时全部走 PNG，不按物种名写死。
 */
export const SPECIES_WITH_BODY_PACKS: readonly string[] = []

export function hasSpeciesBodyPacks(type: string): boolean {
  return SPECIES_WITH_BODY_PACKS.includes(type)
}
