import type { IOutfitLogRepository } from '@/domain/repositories/IOutfitLogRepository'
import type { IPetRepository } from '@/domain/repositories/IPetRepository'
import { OutfitLog } from '@/domain/models/OutfitLog'
import { DEFAULT_OUTFIT_SET_ID } from '@/domain/models/Pet'
import {
  OUTFIT_CATALOG,
  isOutfitPackReady,
} from '@/domain/outfits/outfitCatalog'
import type { OutfitSetDefinition } from '@/domain/outfits/outfitCatalog'
import type { AsyncMutex } from '@/shared/asyncMutex'
import { DEFAULT_CHILD_ID } from '@/shared/constants'
import type { PointService } from './PointService'

export type OutfitBuyResult =
  | { ok: true }
  | { ok: false; reason: 'unknown' | 'already_owned' | 'insufficient_points' | 'busy' }

export type OutfitEquipResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'not_owned' | 'busy' }

export class OutfitService {
  constructor(
    private petRepo: IPetRepository,
    private logRepo: IOutfitLogRepository,
    private pointService: PointService,
    private mutex: AsyncMutex,
    private catalog: readonly OutfitSetDefinition[] = OUTFIT_CATALOG,
    private packFiles: readonly string[] = [],
  ) {}

  async buy(outfitSetId: string): Promise<OutfitBuyResult> {
    return this.withLock(() => this.buyUnlocked(outfitSetId), { ok: false, reason: 'busy' })
  }

  async equip(petId: string, outfitSetId: string): Promise<OutfitEquipResult> {
    return this.withLock(() => this.equipUnlocked(petId, outfitSetId), { ok: false, reason: 'busy' })
  }

  async listLogs(): Promise<OutfitLog[]> {
    return this.logRepo.findByChildId(DEFAULT_CHILD_ID)
  }

  private async buyUnlocked(outfitSetId: string): Promise<OutfitBuyResult> {
    const def = this.catalog.find((set) => set.id === outfitSetId)
    if (def === undefined || !isOutfitPackReady(def, this.packFiles)) {
      return { ok: false, reason: 'unknown' }
    }
    if (def.id === DEFAULT_OUTFIT_SET_ID) {
      return { ok: false, reason: 'already_owned' }
    }

    const owned = await this.logRepo.findByChildIdAndOutfitSetId(DEFAULT_CHILD_ID, def.id)
    if (owned !== null) {
      return { ok: false, reason: 'already_owned' }
    }

    const spent = await this.pointService.spendOnPet(def.points)
    if (!spent) {
      return { ok: false, reason: 'insufficient_points' }
    }

    try {
      await this.logRepo.insert(OutfitLog.create({
        id: crypto.randomUUID(),
        childId: DEFAULT_CHILD_ID,
        outfitSetId: def.id,
        outfitName: def.name,
        pointsCost: def.points,
      }))
    } catch (error) {
      await this.pointService.reversePetSpend(def.points)
      throw error
    }

    return { ok: true }
  }

  private async equipUnlocked(petId: string, outfitSetId: string): Promise<OutfitEquipResult> {
    const pet = await this.petRepo.findById(petId)
    if (pet === null) {
      return { ok: false, reason: 'not_found' }
    }
    if (outfitSetId !== DEFAULT_OUTFIT_SET_ID) {
      const owned = await this.logRepo.findByChildIdAndOutfitSetId(pet.childId, outfitSetId)
      if (owned === null) {
        return { ok: false, reason: 'not_owned' }
      }
    }

    pet.outfitSetId = outfitSetId
    await this.petRepo.save(pet)
    return { ok: true }
  }

  private async withLock<T>(fn: () => Promise<T>, onBusy: T): Promise<T> {
    const release = this.mutex.tryAcquire()
    if (release === null) return onBusy
    try {
      return await fn()
    } finally {
      release()
    }
  }
}
