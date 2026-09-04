import type { PetStage } from '@/domain/valueObjects/PetStage'
import { getPetImage } from '@/presentation/pages/Pet/PetDisplay'

interface PetMiniCardProps {
  petName: string
  petType: string
  stageName: string
  stage: PetStage
  moodEmoji: string
  expProgress: number
  onTap: () => void
}

export default function PetMiniCard({
  petName,
  petType,
  stageName,
  stage,
  moodEmoji,
  expProgress,
  onTap,
}: PetMiniCardProps) {
  return (
    <button
      onClick={onTap}
      className="w-full text-left active:scale-[0.98] transition-transform"
      style={{
        backgroundColor: '#FFF8F0',
        borderRadius: '20px',
        padding: '16px 18px',
        boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9)',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center" style={{ gap: '14px' }}>
        {/* Pet avatar */}
        <div
          className="flex items-center justify-center"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '4px 4px 8px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <img
            src={getPetImage(petType, stage)}
            alt={petName}
            style={{ width: '44px', height: '44px', objectFit: 'contain' }}
            draggable={false}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {petName}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-accent)',
                backgroundColor: 'rgba(126,207,192,0.15)',
                borderRadius: '8px',
                padding: '2px 8px',
              }}
            >
              Lv.{stage} {stageName}
            </span>
            <span style={{ fontSize: '14px', lineHeight: 1, marginLeft: '2px' }}>{moodEmoji}</span>
          </div>

          {/* Experience mini bar */}
          <div
            style={{
              width: '100%',
              maxWidth: '120px',
              height: '6px',
              backgroundColor: '#F0E8E0',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, expProgress * 100))}%`,
                height: '100%',
                backgroundColor: 'var(--color-accent)',
                borderRadius: '3px',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      </div>
    </button>
  )
}
