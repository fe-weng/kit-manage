import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'
import { usePetStore } from '@/presentation/hooks/usePetStore'
import { ROUTES } from '@/shared/constants'
import { toast } from '@/shared/toast'
import type { PetCollectionItem } from '@/application/services/PetService'
import CollectionCard from './CollectionCard'
import PetNameModal from './PetNameModal'

export default function PetCollectionPage() {
  const navigate = useNavigate()
  const {
    collection,
    collectionLoading,
    adopting,
    renaming,
    switchingDisplay,
    fetchCollection,
    checkAdoption,
    adoptPet,
    renamePet,
    setDisplayed,
  } = usePetStore()

  const [renameTarget, setRenameTarget] = useState<PetCollectionItem | null>(null)
  const [adoptType, setAdoptType] = useState<PetCollectionItem | null>(null)
  const actionRef = useRef(false)

  useEffect(() => {
    fetchCollection()
  }, [fetchCollection])

  const handleBack = useCallback(() => {
    navigate(ROUTES.PET)
  }, [navigate])

  const handleAdoptClick = useCallback(async (item: PetCollectionItem) => {
    if (actionRef.current) return
    actionRef.current = true
    try {
      const result = await checkAdoption(item.type)
      if (!result.allowed) {
        toast.error(result.message)
        return
      }
      setAdoptType(item)
    } finally {
      actionRef.current = false
    }
  }, [checkAdoption])

  const handleAdoptConfirm = useCallback(async (name: string) => {
    if (!adoptType) return
    try {
      await adoptPet(name, adoptType.type)
      toast.success('领养成功，快去和它打个招呼吧！')
      setAdoptType(null)
      navigate(ROUTES.PET)
    } catch (err) {
      const message = err instanceof Error ? err.message : '领养失败，请重试'
      toast.error(message)
    }
  }, [adoptPet, adoptType, navigate])

  const handleRenameConfirm = useCallback(async (name: string) => {
    if (!renameTarget?.pet) return
    try {
      await renamePet(renameTarget.pet.id, name)
      toast.success('宠物名字已更新')
      setRenameTarget(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : '改名失败，请重试'
      toast.error(message)
    }
  }, [renamePet, renameTarget])

  const handleSetDisplayed = useCallback(async (item: PetCollectionItem) => {
    if (!item.pet || actionRef.current) return
    actionRef.current = true
    try {
      await setDisplayed(item.pet.id)
      navigate(ROUTES.PET)
    } catch (err) {
      const message = err instanceof Error ? err.message : '切换失败，请重试'
      toast.error(message)
    } finally {
      actionRef.current = false
    }
  }, [navigate, setDisplayed])

  const busy = adopting || renaming || switchingDisplay

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
          onClick={handleBack}
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
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
          宠物图鉴
        </h1>
        {collection && (
          <span className="text-[14px] font-semibold text-text-sub">
            {collection.adoptedCount}/{collection.totalCount}
          </span>
        )}
      </div>

      {collection?.isComplete && (
        <div
          className="text-center font-semibold text-accent bg-card rounded-[14px] shadow-clay-button"
          style={{ padding: '12px 16px', fontSize: '14px' }}
        >
          已集齐全部宠物
        </div>
      )}

      {collectionLoading && !collection ? (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <span className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[700px]:grid-cols-2" style={{ gap: '12px' }}>
          {collection?.items.map((item) => (
            <CollectionCard
              key={item.type}
              item={item}
              busy={busy}
              onRename={() => setRenameTarget(item)}
              onSetDisplayed={() => handleSetDisplayed(item)}
              onAdopt={() => handleAdoptClick(item)}
            />
          ))}
        </div>
      )}

      <PetNameModal
        visible={renameTarget !== null}
        title="修改宠物名字"
        confirmLabel="保存"
        initialName={renameTarget?.pet?.name ?? ''}
        submitting={renaming}
        onClose={() => setRenameTarget(null)}
        onConfirm={handleRenameConfirm}
      />

      <PetNameModal
        visible={adoptType !== null}
        title={`给${adoptType?.typeLabel ?? '它'}起个名字`}
        confirmLabel="确认领养"
        submitting={adopting}
        onClose={() => setAdoptType(null)}
        onConfirm={handleAdoptConfirm}
      />
    </div>
  )
}
