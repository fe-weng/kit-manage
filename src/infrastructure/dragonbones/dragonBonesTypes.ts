export interface DragonBonesSlot {
  displayIndex: number
}

export interface DragonBonesArmature {
  getSlot(name: string): DragonBonesSlot | null
  dispose(): void
}

export interface DragonBonesAnimation {
  animationNames: string[]
  play(animationName: string, playTimes?: number): void
  gotoAndStopByTime(animationName: string, time?: number): void
  stop(animationName?: string): void
}

export interface DragonBonesArmatureDisplay {
  armature: DragonBonesArmature
  animation: DragonBonesAnimation
  x: number
  y: number
  addDBEventListener(type: string, listener: (event: unknown) => void, target: unknown): void
  removeDBEventListener(type: string, listener: (event: unknown) => void, target: unknown): void
  dispose(): void
}

export interface DragonBonesData {
  armatureNames: string[]
}

export interface DragonBonesFactory {
  parseDragonBonesData(rawData: unknown, name?: string | null): DragonBonesData | null
  parseTextureAtlasData(rawData: unknown, textureAtlas: unknown, name?: string | null): unknown
  buildArmatureDisplay(
    armatureName: string,
    dragonBonesName?: string,
  ): DragonBonesArmatureDisplay | null
  replaceSlotDisplay(
    dragonBonesName: string,
    armatureName: string,
    slotName: string,
    displayName: string,
    slot: DragonBonesSlot,
    displayIndex?: number,
  ): boolean
  clear(disposeData?: boolean): void
}

export interface DragonBonesRuntime {
  PixiFactory: new (dataParser?: null, useSharedTicker?: boolean) => DragonBonesFactory
  EventObject: { COMPLETE: string }
}
