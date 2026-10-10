/**
 * 构建期纳入的 public/pets/armatures 与 public/pets/outfits 文件。
 * 路径相对 public。本期没有身体包，也没有付费套。
 */
export const PET_ASSET_FILES: readonly string[] = []

/** 身体包已在清单中的物种。空清单时全部走 PNG。 */
export const SPECIES_WITH_BODY_PACKS: readonly string[] = []

export function hasSpeciesBodyPacks(type: string): boolean {
  return SPECIES_WITH_BODY_PACKS.includes(type)
}
