import { describe, expect, it } from 'vitest'
import type { IOutfitLogRepository } from '@/domain/repositories/IOutfitLogRepository'
import type { IPetRepository } from '@/domain/repositories/IPetRepository'
import type { IPointRepository } from '@/domain/repositories/IPointRepository'
import { OutfitLog } from '@/domain/models/OutfitLog'
import { Pet } from '@/domain/models/Pet'
import { PointBalance } from '@/domain/models/PointBalance'
import { PetStage } from '@/domain/valueObjects/PetStage'
import type { OutfitSetDefinition } from '@/domain/outfits/outfitCatalog'
import { AsyncMutex } from '@/shared/asyncMutex'
import { PointService } from './PointService'
import { OutfitService } from './OutfitService'

const PAID: OutfitSetDefinition = {
  id: 'star-gown',
  name: '星星裙',
  points: 30,
  pack: 'pets/outfits/star-gown',
}

const DEFAULT_SET: OutfitSetDefinition = {
  id: 'default',
  name: '默认套',
  points: 0,
  pack: null,
}

const PACK_FILES = [
  'young_ske.json',
  'young_tex.json',
  'young_tex.png',
  'grown_ske.json',
  'grown_tex.json',
  'grown_tex.png',
] as const

function readyFiles(): string[] {
  return PACK_FILES.map((name) => `${PAID.pack}/${name}`)
}

class MemoryPetRepository implements IPetRepository {
  pets: Pet[] = []

  async findDisplayedByChildId(childId: string): Promise<Pet | null> {
    return this.pets.find((pet) => pet.childId === childId && pet.isDisplayed) ?? null
  }

  async findRaisingByChildId(childId: string): Promise<Pet | null> {
    return this.pets.find((pet) => pet.childId === childId && pet.canContinueRaising()) ?? null
  }

  async findAllByChildId(childId: string): Promise<Pet[]> {
    return this.pets.filter((pet) => pet.childId === childId)
  }

  async findById(id: string): Promise<Pet | null> {
    return this.pets.find((pet) => pet.id === id) ?? null
  }

  async existsByChildIdAndType(childId: string, type: string): Promise<boolean> {
    return this.pets.some((pet) => pet.childId === childId && pet.type === type)
  }

  async switchDisplayed(): Promise<void> {
    throw new Error('switchDisplayed 不应在装扮服务测试中被调用')
  }

  async save(pet: Pet): Promise<void> {
    const index = this.pets.findIndex((item) => item.id === pet.id)
    if (index === -1) this.pets.push(pet)
    else this.pets[index] = pet
  }

  async delete(id: string): Promise<void> {
    this.pets = this.pets.filter((pet) => pet.id !== id)
  }
}

class MemoryOutfitLogRepository implements IOutfitLogRepository {
  logs: OutfitLog[] = []
  insertError: Error | null = null

  async findByChildId(childId: string): Promise<OutfitLog[]> {
    return this.logs
      .filter((log) => log.childId === childId)
      .slice()
      .sort((a, b) => b.redeemedAt - a.redeemedAt)
  }

  async findByChildIdAndOutfitSetId(childId: string, outfitSetId: string): Promise<OutfitLog | null> {
    return this.logs.find((log) => log.childId === childId && log.outfitSetId === outfitSetId) ?? null
  }

  async insert(log: OutfitLog): Promise<void> {
    if (this.insertError !== null) throw this.insertError
    this.logs.push(log)
  }
}

class MemoryPointRepository implements IPointRepository {
  balance: PointBalance | null = null

  async findByChildId(childId: string): Promise<PointBalance | null> {
    if (this.balance === null || this.balance.childId !== childId) return null
    return this.balance
  }

  async save(balance: PointBalance): Promise<void> {
    this.balance = balance
  }
}

function setup(options?: { earned?: number; files?: readonly string[] }) {
  const pets = new MemoryPetRepository()
  const logs = new MemoryOutfitLogRepository()
  const pointRepo = new MemoryPointRepository()
  const balance = new PointBalance({
    childId: 'default',
    totalEarned: options?.earned ?? 100,
    totalSpentOnPet: 0,
    totalSpentOnReward: 0,
  })
  pointRepo.balance = balance
  const pet = new Pet({
    id: 'pet-1',
    childId: 'default',
    name: '小鸡',
    type: 'chicken',
    stage: PetStage.HATCHED,
    exp: 0,
    mood: 80,
    moodUpdatedAt: 1,
    createdAt: 1,
    isDisplayed: true,
  })
  pets.pets.push(pet)
  const mutex = new AsyncMutex()
  const service = new OutfitService(
    pets,
    logs,
    new PointService(pointRepo),
    mutex,
    [DEFAULT_SET, PAID],
    options?.files ?? readyFiles(),
  )
  return { service, pets, logs, balance, pet, mutex }
}

describe('OutfitService', () => {
  it('兑换成功写一条日志且不改穿着', async () => {
    const { service, logs, pet, balance } = setup()

    const result = await service.buy('star-gown')

    expect(result).toEqual({ ok: true })
    expect(logs.logs).toHaveLength(1)
    const log = logs.logs[0]
    expect(log?.outfitSetId).toBe('star-gown')
    expect(log?.outfitName).toBe('星星裙')
    expect(log?.pointsCost).toBe(30)
    expect(pet.outfitSetId).toBe('default')
    expect(balance.totalSpentOnPet).toBe(30)
    expect(balance.totalSpentOnReward).toBe(0)
  })

  it('再次兑换得到 already_owned 且积分不变', async () => {
    const { service, logs, balance } = setup()

    await service.buy('star-gown')
    const result = await service.buy('star-gown')

    expect(result).toEqual({ ok: false, reason: 'already_owned' })
    expect(logs.logs).toHaveLength(1)
    expect(balance.totalSpentOnPet).toBe(30)
    expect(balance.currentBalance).toBe(70)
  })

  it('积分不足不写日志', async () => {
    const { service, logs, balance } = setup({ earned: 10 })

    const result = await service.buy('star-gown')

    expect(result).toEqual({ ok: false, reason: 'insufficient_points' })
    expect(logs.logs).toHaveLength(0)
    expect(balance.totalSpentOnPet).toBe(0)
  })

  it('未知 id 与未就绪套装得到 unknown', async () => {
    const ready = setup()
    const missing = setup({ files: readyFiles().slice(1) })

    expect(await ready.service.buy('no-such-set')).toEqual({ ok: false, reason: 'unknown' })
    expect(ready.logs.logs).toHaveLength(0)
    expect(ready.balance.totalSpentOnPet).toBe(0)

    expect(await missing.service.buy('star-gown')).toEqual({ ok: false, reason: 'unknown' })
    expect(missing.logs.logs).toHaveLength(0)
    expect(missing.balance.totalSpentOnPet).toBe(0)
  })

  it('插入失败时宠物消费被回滚', async () => {
    const { service, logs, balance, pet } = setup()
    logs.insertError = new Error('insert failed')

    await expect(service.buy('star-gown')).rejects.toThrow('insert failed')
    expect(logs.logs).toHaveLength(0)
    expect(balance.totalSpentOnPet).toBe(0)
    expect(balance.totalSpentOnReward).toBe(0)
    expect(balance.currentBalance).toBe(100)
    expect(pet.outfitSetId).toBe('default')
  })

  it('未拥有不能穿上', async () => {
    const { service, pet, logs } = setup()

    const result = await service.equip('pet-1', 'star-gown')

    expect(result).toEqual({ ok: false, reason: 'not_owned' })
    expect(pet.outfitSetId).toBe('default')
    expect(pet.isDisplayed).toBe(true)
    expect(logs.logs).toHaveLength(0)
  })

  it('穿上 default 不要求日志', async () => {
    const { service, pet, logs } = setup()
    pet.outfitSetId = 'star-gown'

    const result = await service.equip('pet-1', 'default')

    expect(result).toEqual({ ok: true })
    expect(pet.outfitSetId).toBe('default')
    expect(logs.logs).toHaveLength(0)
  })

  it('穿上不新增日志', async () => {
    const { service, pet, logs } = setup()
    await logs.insert(new OutfitLog({
      id: 'log-1',
      childId: 'default',
      outfitSetId: 'star-gown',
      outfitName: '星星裙',
      pointsCost: 30,
      redeemedAt: 1,
    }))

    const result = await service.equip('pet-1', 'star-gown')

    expect(result).toEqual({ ok: true })
    expect(pet.outfitSetId).toBe('star-gown')
    expect(pet.isDisplayed).toBe(true)
    expect(logs.logs).toHaveLength(1)
  })

  it('listLogs 按 redeemedAt 倒序', async () => {
    const { service, logs } = setup()
    await logs.insert(new OutfitLog({
      id: 'log-old',
      childId: 'default',
      outfitSetId: 'star-gown',
      outfitName: '星星裙',
      pointsCost: 30,
      redeemedAt: 1,
    }))
    await logs.insert(new OutfitLog({
      id: 'log-new',
      childId: 'default',
      outfitSetId: 'moon-cape',
      outfitName: '月亮披风',
      pointsCost: 40,
      redeemedAt: 5,
    }))

    const listed = await service.listLogs()

    expect(listed.map((log) => log.id)).toEqual(['log-new', 'log-old'])
  })

  it('锁占用时兑换直接失败且不扣分', async () => {
    const { service, mutex, balance, logs } = setup()
    const release = mutex.tryAcquire()
    if (release === null) throw new Error('测试锁应能占用')

    const result = await service.buy('star-gown')

    expect(result).toEqual({ ok: false, reason: 'busy' })
    expect(balance.totalSpentOnPet).toBe(0)
    expect(logs.logs).toHaveLength(0)
    release()
  })
})
