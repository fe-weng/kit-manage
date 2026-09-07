import { useEffect, useState, useCallback, useRef } from 'react'
import { usePetStore } from '@/presentation/hooks/usePetStore'
import { usePointStore } from '@/presentation/hooks/usePointStore'
import { FEED_POINT_COST } from '@/domain/rules/PetGrowthRule'
import type { PetStage } from '@/domain/valueObjects/PetStage'
import CreatePetForm from './CreatePetForm'
import PetDisplay from './PetDisplay'
import StatusPanel from './StatusPanel'
import ActionButtons from './ActionButtons'
import EvolutionOverlay from './EvolutionOverlay'

export default function PetPage() {
  const { status, loading, fetchPet, feed, petAction, createPet } = usePetStore()
  const { balance, fetchBalance } = usePointStore()
  const [feeding, setFeeding] = useState(false)
  const feedingRef = useRef(false)
  const [evolved, setEvolved] = useState(false)
  const prevStageRef = useRef<PetStage | undefined>(undefined)

  useEffect(() => {
    fetchPet()
    fetchBalance()
  }, [fetchPet, fetchBalance])

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

  const handlePet = useCallback(async () => {
    await petAction()
  }, [petAction])

  const handleCreate = useCallback(
    async (name: string, type: string) => {
      await createPet(name, type)
    },
    [createPet],
  )

  const isMaxLevel = status?.isMaxLevel ?? false
  const canAfford = isMaxLevel || (balance ? balance.currentBalance >= FEED_POINT_COST : false)

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
      <div style={{ paddingTop: '48px', paddingBottom: '100px', paddingLeft: '20px', paddingRight: '20px' }}>
        <CreatePetForm onSubmit={handleCreate} />
      </div>
    )
  }

  const { pet, stageName, expToNext, expProgress, nextStageName, feedCost } = status

  return (
    <div
      className="flex flex-col items-center"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 24px)',
        paddingBottom: '100px',
        paddingLeft: '20px',
        paddingRight: '20px',
        gap: '20px',
      }}
    >
      {/* Points Display */}
      <div className="self-end bg-card rounded-full shadow-clay-button flex items-center" style={{ padding: '6px 14px', gap: '6px' }}>
        <span className="text-[13px] text-text-sub">⭐</span>
        <span className="text-[15px] font-bold text-accent">
          {balance?.currentBalance ?? 0}
        </span>
        <span className="text-[12px] text-text-sub">分</span>
      </div>

      {/* Pet Display */}
      <PetDisplay
        stage={pet.stage}
        name={pet.name}
        petType={pet.type}
        onPet={handlePet}
        evolving={evolved}
        prevStage={prevStageRef.current}
      />

      {/* Status Panel */}
      <StatusPanel
        mood={pet.mood}
        moodEmoji={pet.getMoodEmoji()}
        moodLabel={pet.getMoodLabel()}
        expProgress={expProgress}
        stageName={stageName}
        expToNext={expToNext}
        nextStageName={nextStageName}
      />

      {/* Action Buttons */}
      <ActionButtons
        onFeed={handleFeed}
        onPet={handlePet}
        feedCost={feedCost}
        canAfford={canAfford}
        feeding={feeding}
        isMaxLevel={isMaxLevel}
      />

      {/* Evolution Overlay */}
      <EvolutionOverlay
        visible={evolved}
        onDone={() => setEvolved(false)}
      />
    </div>
  )
}
