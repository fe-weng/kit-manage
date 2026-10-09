import * as PIXI from 'pixi.js'
import { DEFAULT_OUTFIT_SET_ID } from '@/domain/models/Pet'
import { OUTFIT_CATALOG } from '@/domain/outfits/outfitCatalog'
import { PetStage } from '@/domain/valueObjects/PetStage'
import type {
  DragonBonesArmatureDisplay,
  DragonBonesFactory,
  DragonBonesRuntime,
} from '@/infrastructure/dragonbones/dragonBonesTypes'

export type PetMotion = 'idle' | 'eat' | 'pet' | 'paused'

export interface PetCharacterOptions {
  type: string
  stage: PetStage
  outfitSetId: string
  motion: PetMotion
}

const SLOT_BODY_BACK = 'bodyBack'
const SLOT_BODY_FRONT = 'bodyFront'
const SLOT_OUTFIT_BODY = 'outfitBody'
const SLOT_OUTFIT_HEAD = 'outfitHead'

const textureUsers = new Map<string, { base: PIXI.BaseTexture; count: number }>()
let runtimePromise: Promise<DragonBonesRuntime> | null = null

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

function armatureKind(stage: PetStage): 'young' | 'grown' {
  return stage === PetStage.HATCHED ? 'young' : 'grown'
}

function stageToken(stage: PetStage): string {
  if (stage === PetStage.GROWING) return 'growing'
  if (stage === PetStage.MATURE) return 'mature'
  if (stage === PetStage.MAX) return 'max'
  return 'hatched'
}

function loadRuntime(): Promise<DragonBonesRuntime> {
  if (runtimePromise === null) {
    const root = globalThis as typeof globalThis & { PIXI?: typeof PIXI }
    root.PIXI = PIXI
    runtimePromise = import('@/infrastructure/dragonbones/dragonBones.cjs').then((mod) => mod.default)
  }
  return runtimePromise
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`无法加载 ${url}`)
  return response.json() as Promise<unknown>
}

function waitForBaseTexture(base: PIXI.BaseTexture): Promise<void> {
  if (base.valid) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const onLoaded = () => {
      base.off('error', onError)
      resolve()
    }
    const onError = (error: Error) => {
      base.off('loaded', onLoaded)
      reject(error instanceof Error ? error : new Error('贴图加载失败'))
    }
    base.once('loaded', onLoaded)
    base.once('error', onError)
  })
}

async function retainBaseTexture(url: string): Promise<PIXI.BaseTexture> {
  const existing = textureUsers.get(url)
  if (existing) {
    existing.count += 1
    await waitForBaseTexture(existing.base)
    return existing.base
  }
  const base = PIXI.BaseTexture.from(url)
  textureUsers.set(url, { base, count: 1 })
  try {
    await waitForBaseTexture(base)
  } catch (error) {
    textureUsers.delete(url)
    base.destroy()
    throw error
  }
  return base
}

function releaseBaseTexture(url: string): void {
  const existing = textureUsers.get(url)
  if (existing === undefined) return
  existing.count -= 1
  if (existing.count > 0) return
  textureUsers.delete(url)
  if (!existing.base.destroyed) existing.base.destroy()
}

export class PetCharacterPlayer {
  private app: PIXI.Application | null = null
  private factory: DragonBonesFactory | null = null
  private display: DragonBonesArmatureDisplay | null = null
  private runtime: DragonBonesRuntime | null = null
  private observer: ResizeObserver | null = null
  private host: HTMLElement | null = null
  private textureUrls: string[] = []
  private alive = true
  private motion: PetMotion = 'paused'

  private readonly onComplete = (): void => {
    this.applyMotion('idle')
  }

  async mount(host: HTMLElement, options: PetCharacterOptions): Promise<void> {
    this.host = host
    this.motion = options.motion
    const size = await this.waitForSize(host)
    if (!this.alive) return

    const runtime = await loadRuntime()
    if (!this.alive) return
    this.runtime = runtime

    const app = new PIXI.Application({
      width: size.width,
      height: size.height,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    })
    this.app = app
    host.appendChild(app.view as HTMLCanvasElement)

    const factory = new runtime.PixiFactory(null, true)
    this.factory = factory
    const kind = armatureKind(options.stage)
    const body = await this.loadPack(factory, `pets/armatures/${kind}`, kind, kind)
    if (!this.alive) return

    const display = factory.buildArmatureDisplay(body.armatureName, kind)
    if (display === null) throw new Error('无法创建骨架')
    this.display = display

    this.replaceSlot(factory, kind, body.armatureName, SLOT_BODY_BACK, `${options.type}_${stageToken(options.stage)}_${SLOT_BODY_BACK}`)
    this.replaceSlot(factory, kind, body.armatureName, SLOT_BODY_FRONT, `${options.type}_${stageToken(options.stage)}_${SLOT_BODY_FRONT}`)
    await this.applyOutfit(factory, kind, body.armatureName, options.outfitSetId)
    if (!this.alive) return

    app.stage.addChild(display as unknown as PIXI.DisplayObject)
    this.layout()
    this.applyMotion(this.motion)
    this.observer = new ResizeObserver(() => this.layout())
    this.observer.observe(host)
  }

  setMotion(motion: PetMotion): void {
    this.motion = motion
    this.applyMotion(motion)
  }

  destroy(): void {
    if (!this.alive) return
    this.alive = false
    this.observer?.disconnect()
    this.observer = null
    if (this.display !== null && this.runtime !== null) {
      this.display.removeDBEventListener(this.runtime.EventObject.COMPLETE, this.onComplete, this.display)
      this.display.dispose()
    }
    this.display = null
    this.factory?.clear(true)
    this.factory = null
    for (const url of this.textureUrls) releaseBaseTexture(url)
    this.textureUrls = []
    this.app?.destroy(true, { children: true })
    this.app = null
    this.host = null
  }

  private async applyOutfit(
    factory: DragonBonesFactory,
    kind: 'young' | 'grown',
    bodyArmatureName: string,
    outfitSetId: string,
  ): Promise<void> {
    if (outfitSetId === DEFAULT_OUTFIT_SET_ID) {
      this.replaceSlot(factory, kind, bodyArmatureName, SLOT_OUTFIT_BODY, `default_${SLOT_OUTFIT_BODY}`)
      this.replaceSlot(factory, kind, bodyArmatureName, SLOT_OUTFIT_HEAD, `default_${SLOT_OUTFIT_HEAD}`)
      return
    }

    const def = OUTFIT_CATALOG.find((set) => set.id === outfitSetId)
    if (def === undefined || def.pack === null) {
      throw new Error('装扮资源不存在')
    }
    const packId = `${outfitSetId}-${kind}`
    const outfit = await this.loadPack(factory, def.pack, kind, packId)
    if (!this.alive) return
    this.replaceSlot(factory, packId, outfit.armatureName, SLOT_OUTFIT_BODY, SLOT_OUTFIT_BODY)
    this.replaceSlot(factory, packId, outfit.armatureName, SLOT_OUTFIT_HEAD, SLOT_OUTFIT_HEAD)
  }

  private replaceSlot(
    factory: DragonBonesFactory,
    dragonBonesName: string,
    sourceArmatureName: string,
    slotName: string,
    displayName: string,
  ): void {
    const slot = this.display?.armature.getSlot(slotName)
    if (slot === null || slot === undefined) return
    factory.replaceSlotDisplay(dragonBonesName, sourceArmatureName, slotName, displayName, slot)
  }

  private async loadPack(
    factory: DragonBonesFactory,
    directory: string,
    kind: 'young' | 'grown',
    packId: string,
  ): Promise<{ armatureName: string }> {
    const folder = directory.endsWith('/') ? directory.slice(0, -1) : directory
    const skeUrl = assetUrl(`${folder}/${kind}_ske.json`)
    const texJsonUrl = assetUrl(`${folder}/${kind}_tex.json`)
    const texPngUrl = assetUrl(`${folder}/${kind}_tex.png`)
    const [ske, texJson, base] = await Promise.all([
      fetchJson(skeUrl),
      fetchJson(texJsonUrl),
      retainBaseTexture(texPngUrl),
    ])
    if (!this.alive) {
      releaseBaseTexture(texPngUrl)
      return { armatureName: '' }
    }
    this.textureUrls.push(texPngUrl)

    const data = factory.parseDragonBonesData(ske, packId)
    factory.parseTextureAtlasData(texJson, base, packId)
    const armatureName = data?.armatureNames[0]
    if (data === null || armatureName === undefined) throw new Error('骨架数据为空')
    return { armatureName }
  }

  private applyMotion(motion: PetMotion): void {
    const display = this.display
    const runtime = this.runtime
    if (display === null || runtime === null) return
    display.removeDBEventListener(runtime.EventObject.COMPLETE, this.onComplete, display)
    const names = display.animation.animationNames
    if (motion === 'paused') {
      if (names.includes('idle')) display.animation.gotoAndStopByTime('idle', 0)
      else display.animation.stop()
      return
    }
    const name = motion !== 'idle' && names.includes(motion) ? motion : 'idle'
    if (name === 'idle') {
      display.animation.play('idle', 0)
      return
    }
    display.animation.play(name, 1)
    display.addDBEventListener(runtime.EventObject.COMPLETE, this.onComplete, display)
  }

  private layout(): void {
    const host = this.host
    const app = this.app
    const display = this.display
    if (host === null || app === null || display === null) return
    const width = Math.round(host.clientWidth)
    const height = Math.round(host.clientHeight)
    if (width <= 0 || height <= 0) return
    app.renderer.resize(width, height)
    display.x = width / 2
    display.y = height / 2
  }

  private waitForSize(host: HTMLElement): Promise<{ width: number; height: number }> {
    const current = this.readSize(host)
    if (current !== null) return Promise.resolve(current)
    return new Promise((resolve) => {
      const observer = new ResizeObserver(() => {
        const size = this.readSize(host)
        if (size === null) return
        observer.disconnect()
        resolve(size)
      })
      observer.observe(host)
      this.observer = observer
    })
  }

  private readSize(host: HTMLElement): { width: number; height: number } | null {
    const width = Math.round(host.clientWidth)
    const height = Math.round(host.clientHeight)
    if (width <= 0 || height <= 0) return null
    return { width, height }
  }
}
