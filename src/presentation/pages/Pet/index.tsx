import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetStore } from '@/presentation/hooks/usePetStore'
import { usePointStore } from '@/presentation/hooks/usePointStore'
import { FEED_POINT_COST } from '@/domain/rules/PetGrowthRule'
import { ROUTES } from '@/shared/constants'
import type { PetStage } from '@/domain/valueObjects/PetStage'
import CreatePetForm from './CreatePetForm'
import PetDisplay from './PetDisplay'
import StatusPanel from './StatusPanel'
import ActionButtons from './ActionButtons'
import EvolutionOverlay from './EvolutionOverlay'
import PetToolbar from './PetToolbar'
import RaisingShortcutCard from './RaisingShortcutCard'
import { getEvolutionKind } from './evolutionTransition'

export default function PetPage() {
  const {
    status,
    raisingStatus,
    collection,
    loading,
    switchingDisplay,
    fetchPet,
    fetchCollection,
    feed,
    petAction,
    createPet,
    setDisplayed,
  } = usePetStore()
  const { balance, fetchBalance } = usePointStore()
  const navigate = useNavigate()
  const [feeding, setFeeding] = useState(false)
  const feedingRef = useRef(false)
  const [evolved, setEvolved] = useState(false)
  const prevStageRef = useRef<PetStage | undefined>(undefined)
  const switchingRef = useRef(false)

  useEffect(() => {
    fetchPet()
    fetchCollection()
    fetchBalance()
  }, [fetchPet, fetchCollection, fetchBalance])

  const handleFeed = useCallback(async () => {
    if (feedingRef.current) return
    feedingRef.current = true
    setFeeding(true)
    try {
      prevStageRef.current = status?.pet.stage
      const result = await feed()
      if (result.evolved) {
        setEvolved(true)
      }
    } finally {
      feedingRef.current = false
      setFeeding(false)
    }
  }, [feed, status])

  const pettingRef = useRef(false)
  const handlePet = useCallback(async () => {
    if (pettingRef.current) return
    pettingRef.current = true
    try {
      await petAction()
    } finally {
      pettingRef.current = false
    }
  }, [petAction])

  const handleCreate = useCallback(
    async (name: string, type: string) => {
      await createPet(name, type)
      await fetchCollection()
    },
    [createPet, fetchCollection],
  )

  const handleOpenCollection = useCallback(() => {
    navigate(ROUTES.PET_COLLECTION)
  }, [navigate])

  const handleSwitchToRaising = useCallback(async () => {
    if (!raisingStatus || switchingRef.current) return
    switchingRef.current = true
    try {
      await setDisplayed(raisingStatus.pet.id)
    } finally {
      switchingRef.current = false
    }
  }, [raisingStatus, setDisplayed])

  const isMaxLevel = status?.isMaxLevel ?? false
  const canAfford = balance ? balance.currentBalance >= FEED_POINT_COST : false

  if (loading && !status) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: 'calc(100dvh - 80px)', paddingTop: '48px' }}
      >
        <span className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!status) {
    return (
      <div style={{ paddingTop: '48px', paddingBottom: '24px', paddingLeft: '20px', paddingRight: '20px' }}>
        <CreatePetForm onSubmit={handleCreate} />
      </div>
    )
  }

  const { pet, stageName, expToNext, expProgress, nextStageName, feedCost } = status
  const evolutionKind =
    evolved && prevStageRef.current != null
      ? getEvolutionKind(prevStageRef.current, pet.stage)
      : null
  const showRaisingShortcut =
    isMaxLevel &&
    raisingStatus !== null &&
    raisingStatus.pet.id !== pet.id
  const canAdoptHint = Boolean(
    collection &&
    collection.items.some((item) => !item.adopted) &&
    !raisingStatus,
  )

  return (
    <div
      className="flex flex-col items-center"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 24px)',
        paddingBottom: '24px',
        paddingLeft: '20px',
        paddingRight: '20px',
        gap: '20px',
      }}
    >
      <PetToolbar
        adoptedCount={collection?.adoptedCount ?? 1}
        totalCount={collection?.totalCount ?? 2}
        canAdoptHint={canAdoptHint}
        balance={balance?.currentBalance ?? 0}
        onOpenCollection={handleOpenCollection}
      />

      <PetDisplay
        stage={pet.stage}
        name={pet.name}
        petType={pet.type}
        onPet={handlePet}
        evolving={evolved}
        prevStage={prevStageRef.current}
        evolutionKind={evolutionKind}
      />

      <StatusPanel
        mood={pet.mood}
        moodEmoji={pet.getMoodEmoji()}
        moodLabel={pet.getMoodLabel()}
        expProgress={expProgress}
        stageName={stageName}
        expToNext={expToNext}
        nextStageName={nextStageName}
      />

      {showRaisingShortcut && (
        <RaisingShortcutCard
          petName={raisingStatus.pet.name}
          petType={raisingStatus.pet.type}
          stageName={raisingStatus.stageName}
          stage={raisingStatus.pet.stage}
          moodEmoji={raisingStatus.pet.getMoodEmoji()}
          expProgress={raisingStatus.expProgress}
          disabled={switchingDisplay}
          onTap={handleSwitchToRaising}
        />
      )}

      <ActionButtons
        onFeed={handleFeed}
        onPet={handlePet}
        feedCost={feedCost}
        canAfford={canAfford}
        feeding={feeding}
        isMaxLevel={isMaxLevel}
      />

      <EvolutionOverlay
        visible={evolved}
        kind={evolutionKind}
        onDone={() => setEvolved(false)}
      />
    </div>
  )
}
