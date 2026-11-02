import type { Ref } from 'react'
import { Cookie } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ActionButtonsProps {
  onFeed: () => void
  feedCost: number
  canAfford: boolean
  feeding: boolean
  eating?: boolean
  isMaxLevel: boolean
  feedButtonRef?: Ref<HTMLDivElement>
}

export default function ActionButtons({
  onFeed,
  feedCost,
  canAfford,
  feeding,
  eating = false,
  isMaxLevel,
  feedButtonRef,
}: ActionButtonsProps) {
  const feedLocked = feeding || eating
  const showFeed = !isMaxLevel || eating

  if (!showFeed) {
    return null
  }

  return (
    <div ref={feedButtonRef} className="w-full">
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
  )
}
