import { BookOpen } from '@phosphor-icons/react'

interface PetToolbarProps {
  adoptedCount: number
  totalCount: number
  canAdoptHint: boolean
  balance: number
  onOpenCollection: () => void
}

export default function PetToolbar({
  adoptedCount,
  totalCount,
  canAdoptHint,
  balance,
  onOpenCollection,
}: PetToolbarProps) {
  return (
    <div className="flex items-center justify-between w-full" style={{ gap: '12px' }}>
      <button
        type="button"
        onClick={onOpenCollection}
        className="flex items-center bg-card rounded-full shadow-clay-button active:scale-[0.98] transition-transform"
        style={{ padding: '8px 14px', gap: '8px', minHeight: '44px', border: 'none' }}
        aria-label={`宠物图鉴 ${adoptedCount}/${totalCount}${canAdoptHint ? '，可领养' : ''}`}
      >
        <BookOpen size={18} weight="duotone" className="text-accent" />
        <span className="text-[14px] font-bold text-text-main">
          宠物图鉴 {adoptedCount}/{totalCount}
        </span>
        {canAdoptHint && (
          <span
            className="text-[11px] font-bold"
            style={{
              color: '#FFFFFF',
              backgroundColor: '#FFB74D',
              borderRadius: '999px',
              padding: '2px 8px',
            }}
          >
            可领养
          </span>
        )}
      </button>

      <div
        className="flex items-center bg-card rounded-full shadow-clay-button shrink-0"
        style={{ padding: '8px 14px', gap: '6px', minHeight: '44px' }}
      >
        <span className="text-[13px] text-text-sub" aria-hidden="true">⭐</span>
        <span className="text-[15px] font-bold text-accent">{balance}</span>
        <span className="text-[12px] text-text-sub">分</span>
      </div>
    </div>
  )
}
