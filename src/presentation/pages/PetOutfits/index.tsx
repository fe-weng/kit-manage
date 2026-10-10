import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft, CaretRight, TShirt } from '@phosphor-icons/react'
import { DEFAULT_OUTFIT_SET_ID } from '@/domain/models/Pet'
import type { OutfitLog } from '@/domain/models/OutfitLog'
import type { PetStage } from '@/domain/valueObjects/PetStage'
import type { OutfitSetDefinition } from '@/domain/outfits/outfitCatalog'
import { useOutfitStore } from '@/presentation/hooks/useOutfitStore'
import { usePointStore } from '@/presentation/hooks/usePointStore'
import { PET_ASSET_FILES } from '@/presentation/pet/petAssetManifest'
import PetAvatar from '@/presentation/pet/PetAvatar'
import { getPetImage } from '@/presentation/pet/petImage'
import { ROUTES } from '@/shared/constants'
import { toast } from '@/shared/toast'

function isOwned(set: OutfitSetDefinition, logs: OutfitLog[]): boolean {
  if (set.id === DEFAULT_OUTFIT_SET_ID) return true
  return logs.some((log) => log.outfitSetId === set.id)
}

function outfitCardImage(set: OutfitSetDefinition, petType: string, stage: PetStage): string | null {
  if (set.pack === null) return getPetImage(petType, stage)
  const directory = set.pack.endsWith('/') ? set.pack.slice(0, -1) : set.pack
  const cardPath = `${directory}/card.png`
  if (!PET_ASSET_FILES.includes(cardPath)) return null
  return `${import.meta.env.BASE_URL}${cardPath}`
}

interface OutfitCardProps {
  set: OutfitSetDefinition
  imageSrc: string | null
  owned: boolean
  wearing: boolean
  selected: boolean
  canAfford: boolean
  busy: boolean
  onSelect: () => void
  onBuy: () => void
  onEquip: () => void
}

function OutfitCard({
  set,
  imageSrc,
  owned,
  wearing,
  selected,
  canAfford,
  busy,
  onSelect,
  onBuy,
  onEquip,
}: OutfitCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      className="bg-card rounded-[20px] shadow-clay flex flex-col text-center"
      style={{
        padding: '18px 16px',
        gap: '12px',
        border: selected ? '2px solid var(--color-accent)' : '2px solid transparent',
        cursor: 'pointer',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          height: '120px',
          borderRadius: '16px',
          backgroundColor: '#FFF8F0',
        }}
      >
        {imageSrc !== null ? (
          <img
            src={imageSrc}
            alt=""
            draggable={false}
            className="no-native-img-gestures"
            style={{ width: '96px', height: '96px', objectFit: 'contain', pointerEvents: 'none' }}
          />
        ) : (
          <TShirt size={40} weight="duotone" className="text-text-sub" />
        )}
      </div>
      <div>
        <p className="text-[16px] font-bold text-text-main" style={{ margin: 0 }}>{set.name}</p>
        <p className="text-[13px] text-text-sub font-medium" style={{ margin: '4px 0 0' }}>{set.points} 分</p>
      </div>
      {wearing ? (
        <div
          className="text-[13px] font-bold text-accent flex items-center justify-center"
          style={{ height: '44px' }}
        >
          穿着中
        </div>
      ) : owned ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onEquip()
          }}
          disabled={busy}
          className="w-full bg-accent text-white text-[13px] font-bold rounded-[12px] shadow-clay-button active:scale-[0.98] transition-transform disabled:opacity-40"
          style={{ height: '44px', border: 'none' }}
        >
          穿上
        </button>
      ) : (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onBuy()
          }}
          disabled={busy || !canAfford}
          className={`w-full text-[13px] font-bold rounded-[12px] transition-all ${
            canAfford
              ? 'bg-accent text-white shadow-clay-button active:scale-[0.98]'
              : 'bg-[#E0E0E0] text-placeholder cursor-not-allowed'
          }`}
          style={{ height: '44px', border: 'none' }}
        >
          兑换
        </button>
      )}
    </article>
  )
}

export default function PetOutfitsPage() {
  const navigate = useNavigate()
  const {
    outfits,
    pet,
    logs,
    loading,
    buying,
    equipping,
    fetchOutfits,
    buy,
    equip,
  } = useOutfitStore()
  const balance = usePointStore((state) => state.balance)
  const [loaded, setLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const actionRef = useRef(false)
  const busy = buying || equipping

  useEffect(() => {
    fetchOutfits().finally(() => setLoaded(true))
  }, [fetchOutfits])

  useEffect(() => {
    if (!loaded || loading || pet !== null) return
    navigate(ROUTES.PET, { replace: true })
  }, [loaded, loading, navigate, pet])

  const wornId = pet?.outfitSetId ?? DEFAULT_OUTFIT_SET_ID
  const selected = outfits.some((set) => set.id === selectedId)
    ? selectedId ?? wornId
    : wornId
  const currentBalance = balance?.currentBalance ?? 0

  const handleBuy = async (outfitSetId: string) => {
    if (actionRef.current) return
    actionRef.current = true
    try {
      const result = await buy(outfitSetId)
      if (result.ok) {
        toast.success('兑换成功')
        return
      }
      if (result.reason === 'insufficient_points') {
        toast.error('积分不足')
        return
      }
      if (result.reason === 'already_owned') {
        toast.error('已经拥有这套装扮')
        return
      }
      if (result.reason === 'busy') {
        toast.error('操作进行中')
        return
      }
      toast.error('这套装扮还不能兑换')
    } finally {
      actionRef.current = false
    }
  }

  const handleEquip = async (outfitSetId: string) => {
    if (actionRef.current) return
    actionRef.current = true
    try {
      const result = await equip(outfitSetId)
      if (result.ok) return
      if (result.reason === 'not_owned') {
        toast.error('还没有这套装扮')
        return
      }
      if (result.reason === 'busy') {
        toast.error('操作进行中')
        return
      }
      toast.error('穿上失败，请重试')
    } finally {
      actionRef.current = false
    }
  }

  if (!loaded || pet === null) {
    return (
      <div className="flex justify-center" style={{ padding: '48px 0' }}>
        <span className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 16px)',
        paddingBottom: '24px',
        paddingLeft: '20px',
        paddingRight: '20px',
        gap: '16px',
      }}
    >
      <div className="flex items-center" style={{ gap: '8px' }}>
        <button
          type="button"
          onClick={() => navigate(ROUTES.PET)}
          aria-label="返回宠物页"
          className="flex items-center justify-center shrink-0"
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-main)',
          }}
        >
          <CaretLeft size={24} weight="bold" />
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0, flex: 1 }}>
          装扮
        </h1>
        <button
          type="button"
          onClick={() => navigate(ROUTES.PET_OUTFIT_HISTORY)}
          className="flex items-center text-[14px] font-semibold text-accent shrink-0"
          style={{ gap: '2px', border: 'none', background: 'transparent', minHeight: '44px' }}
        >
          兑换记录
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      <p className="text-[14px] text-text-sub" style={{ margin: 0 }}>
        {pet.name}
      </p>

      <div className="flex items-center justify-center" style={{ height: '200px' }}>
        <PetAvatar
          type={pet.type}
          stage={pet.stage}
          outfitSetId={selected}
          motion="paused"
          alt={pet.name}
          style={{ width: '180px', height: '180px', objectFit: 'contain', pointerEvents: 'none' }}
        />
      </div>

      <div className="grid grid-cols-2" style={{ gap: '12px' }}>
        {outfits.map((set) => {
          const owned = isOwned(set, logs)
          return (
            <OutfitCard
              key={set.id}
              set={set}
              imageSrc={outfitCardImage(set, pet.type, pet.stage)}
              owned={owned}
              wearing={pet.outfitSetId === set.id}
              selected={selected === set.id}
              canAfford={currentBalance >= set.points}
              busy={busy}
              onSelect={() => setSelectedId(set.id)}
              onBuy={() => handleBuy(set.id)}
              onEquip={() => handleEquip(set.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
