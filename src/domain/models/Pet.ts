import { PetStage } from '../valueObjects/PetStage'

// ── Pet 数值常量 ──
const INITIAL_MOOD = 80
const MOOD_MAX = 100
const FEED_HUNGER_DECREASE = 30
const FEED_MOOD_INCREASE = 10
const PET_MOOD_INCREASE = 5

/** 心情每小时自然衰减值 */
const MOOD_DECAY_PER_HOUR = 1

// ── 心情阈值 ──
const MOOD_HAPPY = 80
const MOOD_GOOD = 60
const MOOD_NORMAL = 40
const MOOD_SAD = 20

interface PetProps {
  id: string
  childId: string
  name: string
  type: string
  stage: PetStage
  exp: number
  hunger: number
  mood: number
  lastFedAt: number
  moodUpdatedAt: number
  createdAt: number
}

export class Pet {
  readonly id: string
  readonly childId: string
  name: string
  readonly type: string
  stage: PetStage
  exp: number
  hunger: number
  mood: number
  lastFedAt: number
  moodUpdatedAt: number
  readonly createdAt: number

  constructor(props: PetProps) {
    this.id = props.id
    this.childId = props.childId
    this.name = props.name
    this.type = props.type
    this.stage = props.stage
    this.exp = props.exp
    this.hunger = props.hunger
    this.mood = props.mood
    this.lastFedAt = props.lastFedAt
    this.moodUpdatedAt = props.moodUpdatedAt ?? props.lastFedAt
    this.createdAt = props.createdAt
  }

  static create(params: { id: string; childId: string; name: string; type: string }): Pet {
    const now = Date.now()
    return new Pet({
      ...params,
      stage: PetStage.EGG,
      exp: 0,
      hunger: 0,
      mood: INITIAL_MOOD,
      lastFedAt: now,
      moodUpdatedAt: now,
      createdAt: now,
    })
  }

  /** 结算累积的心情衰减，将 mood 更新为当前真实值 */
  applyMoodDecay(): void {
    const now = Date.now()
    const ref = this.moodUpdatedAt || this.lastFedAt
    const hoursSinceUpdate = (now - ref) / (1000 * 60 * 60)
    const decay = Math.floor(hoursSinceUpdate * MOOD_DECAY_PER_HOUR)
    if (decay > 0) {
      this.mood = Math.max(0, this.mood - decay)
      this.moodUpdatedAt = now
    }
  }

  feed(expGain: number): void {
    this.exp += expGain
    this.hunger = Math.max(0, this.hunger - FEED_HUNGER_DECREASE)
    this.mood = Math.min(MOOD_MAX, this.mood + FEED_MOOD_INCREASE)
    this.lastFedAt = Date.now()
    this.moodUpdatedAt = Date.now()
  }

  pet(): void {
    this.mood = Math.min(MOOD_MAX, this.mood + PET_MOOD_INCREASE)
    this.moodUpdatedAt = Date.now()
  }

  evolve(): void {
    if (this.stage >= PetStage.MAX) return
    this.stage = (this.stage + 1) as PetStage
  }

  rename(newName: string): void {
    this.name = newName
  }

  getMoodEmoji(): string {
    if (this.mood >= MOOD_HAPPY) return '😊'
    if (this.mood >= MOOD_GOOD) return '🙂'
    if (this.mood >= MOOD_NORMAL) return '😐'
    if (this.mood >= MOOD_SAD) return '😟'
    return '😢'
  }

  getMoodLabel(): string {
    if (this.mood >= MOOD_HAPPY) return '开心'
    if (this.mood >= MOOD_GOOD) return '不错'
    if (this.mood >= MOOD_NORMAL) return '一般'
    if (this.mood >= MOOD_SAD) return '难过'
    return '很伤心'
  }

  toJSON(): PetProps {
    return {
      id: this.id,
      childId: this.childId,
      name: this.name,
      type: this.type,
      stage: this.stage,
      exp: this.exp,
      hunger: this.hunger,
      mood: this.mood,
      lastFedAt: this.lastFedAt,
      moodUpdatedAt: this.moodUpdatedAt,
      createdAt: this.createdAt,
    }
  }
}
