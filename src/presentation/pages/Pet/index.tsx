import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePetStore } from '@/presentation/hooks/usePetStore'
import { usePointStore } from '@/presentation/hooks/usePointStore'
import { FEED_POINT_COST } from '@/domain/rules/PetGrowthRule'
import { ROUTES } from '@/shared/constants'
import { ADOPTABLE_PET_TYPES } from '@/shared/petTypes'
import type { PetStage } from '@/domain/valueObjects/PetStage'
import CreatePetForm from './CreatePetForm'
import PetDisplay from './PetDisplay'
import StatusPanel from './StatusPanel'
import ActionButtons from './ActionButtons'
import EvolutionOverlay from './EvolutionOverlay'
import PetToolbar from './PetToolbar'
import RaisingShortcutCard from './RaisingShortcutCard'
import FeedingFx from './FeedingFx'
import { getEvolutionKind } from './evolutionTransition'
import {
  FEEDING_DURATION_MS,
  captureFeedFlight,
  pickFeedFood,
  type FeedPoint,
} from './feedingTransition'

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
  const [eating, setEating] = useState(false)
  const [evolved, setEvolved] = useState(false)
  const [pendingEvolution, setPendingEvolution] = useState(false)
  const [flightPoints, setFlightPoints] = useState<{ start: FeedPoint; mouth: FeedPoint; food: string } | null>(null)
  const prevStageRef = useRef<PetStage | undefined>(undefined)
  const lastFeedFoodRef = useRef<string | undefined>(undefined)
  const switchingRef = useRef(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const feedButtonRef = useRef<HTMLDivElement>(null)
  const petHitRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPet()
    fetchCollection()
    fetchBalance()
  }, [fetchPet, fetchCollection, fetchBalance])

  const handleFeed = useCallback(async () => {
    if (feedingRef.current) return
    feedingRef.current = true
    setFeeding(true)
    let startedEating = false
    try {
      prevStageRef.current = status?.pet.stage
      const result = await feed()
      if (!result.success) return
      const flight = captureFeedFlight(stageRef.current, feedButtonRef.current, petHitRef.current)
      const food = pickFeedFood(status?.pet.type ?? '', lastFeedFoodRef.current)
      lastFeedFoodRef.current = food
      setPendingEvolution(result.evolved)
      setFlightPoints(flight ? { ...flight, food } : null)
      setEating(true)
      startedEating = true
    } finally {
      setFeeding(false)
      if (!startedEating) feedingRef.current = false
    }
  }, [feed, status])

  useEffect(() => {
    if (!eating) return
    const timer = setTimeout(() => {
      setEating(false)
      setFlightPoints(null)
      feedingRef.current = false
      if (pendingEvolution) {
        setPendingEvolution(false)
        setEvolved(true)
      }
    }, FEEDING_DURATION_MS)
    return () => clearTimeout(timer)
  }, [eating, pendingEvolution])

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
  const displayStage =
    eating && pendingEvolution && prevStageRef.current != null
      ? prevStageRef.current
      : pet.stage
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
      ref={stageRef}
      className="relative flex flex-col items-center"
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
        totalCount={collection?.totalCount ?? ADOPTABLE_PET_TYPES.length}
        canAdoptHint={canAdoptHint}
        balance={balance?.currentBalance ?? 0}
        onOpenCollection={handleOpenCollection}
      />

      <PetDisplay
        stage={displayStage}
        name={pet.name}
        petType={pet.type}
        onPet={handlePet}
        evolving={evolved}
        eating={eating}
        prevStage={prevStageRef.current}
        evolutionKind={evolutionKind}
        hitAreaRef={petHitRef}
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
        eating={eating}
        isMaxLevel={isMaxLevel}
        feedButtonRef={feedButtonRef}
      />

      {eating && flightPoints && (
        <FeedingFx start={flightPoints.start} mouth={flightPoints.mouth} food={flightPoints.food} />
      )}

      <EvolutionOverlay
        visible={evolved}
        kind={evolutionKind}
        onDone={() => setEvolved(false)}
      />
    </div>
  )
}
