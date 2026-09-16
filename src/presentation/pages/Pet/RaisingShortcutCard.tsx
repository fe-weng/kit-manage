import type { PetStage } from '@/domain/valueObjects/PetStage'
import { getPetImage } from './PetDisplay'
import { CaretRight } from '@phosphor-icons/react'

interface RaisingShortcutCardProps {
  petName: string
  petType: string
  stageName: string
  stage: PetStage
  moodEmoji: string
  expProgress: number
  disabled?: boolean
  onTap: () => void
}

export default function RaisingShortcutCard({
  petName,
  petType,
  stageName,
  stage,
  moodEmoji,
  expProgress,
  disabled,
  onTap,
}: RaisingShortcutCardProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      className="w-full text-left active:scale-[0.98] transition-transform disabled:opacity-60"
      aria-label={`正在养成 ${petName}，点击切换展示`}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '14px 16px',
        boxShadow: '6px 6px 12px rgba(0,0,0,0.08), -3px -3px 8px rgba(255,255,255,0.9)',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      <div className="flex items-center" style={{ gap: '12px' }}>
        <div
          className="flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#FFF8F0',
          }}
        >
          <img
            src={getPetImage(petType, stage)}
            alt=""
            className="no-native-img-gestures"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="text-[12px] font-semibold text-accent" style={{ marginBottom: '2px' }}>
            正在养成
          </div>
          <div className="flex items-center" style={{ gap: '6px' }}>
            <span className="text-[15px] font-bold text-text-main truncate">{petName}</span>
            <span className="text-[12px] text-text-sub shrink-0">
              {stageName} {moodEmoji}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              maxWidth: '140px',
              height: '6px',
              backgroundColor: '#F0E8E0',
              borderRadius: '3px',
              overflow: 'hidden',
              marginTop: '6px',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, expProgress * 100))}%`,
                height: '100%',
                backgroundColor: 'var(--color-accent)',
                borderRadius: '3px',
              }}
            />
          </div>
        </div>

        <CaretRight size={18} className="text-text-sub shrink-0" />
      </div>
    </button>
  )
}
