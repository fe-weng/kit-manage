import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { PetStage } from '@/domain/valueObjects/PetStage'
import { resolveOutfitSetId } from '@/domain/outfits/outfitCatalog'
import { getPetImage } from './petImage'
import { toast } from '@/shared/toast'
import { hasSpeciesBodyPacks } from './armatureManifest'
import { PetCharacterPlayer } from './PetCharacterPlayer'
import type { PetMotion } from './PetCharacterPlayer'

interface PetAvatarProps {
  type: string
  stage: PetStage
  outfitSetId?: string
  motion?: PetMotion
  motionNonce?: number
  className?: string
  style?: CSSProperties
  alt?: string
}

const toastedKeys = new Set<string>()

export type { PetMotion }

export default function PetAvatar({
  type,
  stage,
  outfitSetId,
  motion = 'paused',
  motionNonce = 0,
  className,
  style,
  alt = '',
}: PetAvatarProps) {
  const resolvedOutfitId = resolveOutfitSetId(outfitSetId ?? '')
  const useSkeleton = stage !== PetStage.EGG && hasSpeciesBodyPacks(type)
  const [failed, setFailed] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<PetCharacterPlayer | null>(null)
  const motionRef = useRef(motion)
  motionRef.current = motion

  useEffect(() => {
    setFailed(false)
  }, [type, stage, resolvedOutfitId])

  useEffect(() => {
    if (!useSkeleton || failed) return
    const host = hostRef.current
    if (host === null) return

    const player = new PetCharacterPlayer()
    playerRef.current = player
    let cancelled = false
    player.mount(host, {
      type,
      stage,
      outfitSetId: resolvedOutfitId,
      motion: motionRef.current,
    }).catch(() => {
      if (cancelled) return
      const key = `${type}:${stage}:${resolvedOutfitId}`
      if (!toastedKeys.has(key)) {
        toastedKeys.add(key)
        toast.error('宠物形象加载失败')
      }
      setFailed(true)
    })

    return () => {
      cancelled = true
      player.destroy()
      if (playerRef.current === player) playerRef.current = null
    }
  }, [failed, resolvedOutfitId, stage, type, useSkeleton])

  useEffect(() => {
    playerRef.current?.setMotion(motion)
  }, [motion, motionNonce])

  if (!useSkeleton || failed) {
    return (
      <img
        src={getPetImage(type, stage)}
        alt={alt}
        className={className}
        style={style}
        draggable={false}
      />
    )
  }

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
    />
  )
}
