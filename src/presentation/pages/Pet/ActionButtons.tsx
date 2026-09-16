import type { Ref } from 'react'
import { Cookie, HandWaving } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ActionButtonsProps {
  onFeed: () => void
  onPet: () => void
  feedCost: number
  canAfford: boolean
  feeding: boolean
  eating?: boolean
  isMaxLevel: boolean
  feedButtonRef?: Ref<HTMLDivElement>
}

export default function ActionButtons({
  onFeed,
  onPet,
  feedCost,
  canAfford,
  feeding,
  eating = false,
  isMaxLevel,
  feedButtonRef,
}: ActionButtonsProps) {
  const feedLocked = feeding || eating
  const showFeed = !isMaxLevel || eating

  return (
    <div className="flex w-full" style={{ gap: '12px' }}>
      {showFeed && (
        <div ref={feedButtonRef} className="flex-1">
          <motion.button
            onClick={onFeed}
            disabled={!canAfford || feedLocked}
            whileTap={feedLocked ? undefined : { scale: 0.95 }}
            className="w-full bg-accent text-white font-bold rounded-[14px] shadow-clay-button flex flex-col items-center justify-center transition-all disabled:opacity-40"
            style={{ height: '64px', gap: '4px' }}
          >
            {feeding ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Cookie size={24} weight="duotone" />
                <span className="text-[13px]">喂食 (-{feedCost}分)</span>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Pet Button */}
      <motion.button
        onClick={onPet}
        disabled={eating}
        whileTap={eating ? undefined : { scale: 0.95 }}
        className="flex-1 bg-primary text-white font-bold rounded-[14px] shadow-clay-button flex flex-col items-center justify-center transition-all disabled:opacity-40"
        style={{ height: '64px', gap: '4px' }}
      >
        <HandWaving size={24} weight="duotone" />
        <span className="text-[13px]">抚摸 (免费)</span>
      </motion.button>
    </div>
  )
}
