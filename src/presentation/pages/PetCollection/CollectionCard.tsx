import { PET_ADOPTION_COST } from '@/domain/rules/PetGrowthRule'
import { PetStage } from '@/domain/valueObjects/PetStage'
import type { PetCollectionItem } from '@/application/services/PetService'
import { getPetImage } from '@/presentation/pages/Pet/PetDisplay'

interface CollectionCardProps {
  item: PetCollectionItem
  onRename: () => void
  onSetDisplayed: () => void
  onAdopt: () => void
  busy?: boolean
}

export default function CollectionCard({
  item,
  onRename,
  onSetDisplayed,
  onAdopt,
  busy,
}: CollectionCardProps) {
  if (!item.adopted || !item.pet) {
    return (
      <article
        className="bg-card rounded-[20px] shadow-clay flex flex-col"
        style={{ padding: '18px 16px', gap: '12px' }}
      >
        <div className="flex items-center justify-center" style={{ height: '120px' }}>
          <img
            src={getPetImage(item.type, PetStage.EGG)}
            alt={`${item.typeLabel}蛋`}
            draggable={false}
            style={{
              width: '96px',
              height: '96px',
              objectFit: 'contain',
              filter: 'grayscale(1)',
              opacity: 0.7,
            }}
          />
        </div>
        <div className="text-center">
          <div className="text-[13px] font-semibold text-text-sub">未领养</div>
          <div className="text-[16px] font-bold text-text-main" style={{ marginTop: '4px' }}>
            {item.typeLabel}
          </div>
        </div>
        {item.canAdopt && (
          <button
            type="button"
            onClick={onAdopt}
            disabled={busy}
            className="w-full bg-accent text-white font-bold rounded-[12px] shadow-clay-button active:scale-[0.98] transition-transform disabled:opacity-40"
            style={{ height: '44px', border: 'none' }}
          >
            领养 {PET_ADOPTION_COST}分
          </button>
        )}
      </article>
    )
  }

  return (
    <article
      className="bg-card rounded-[20px] shadow-clay flex flex-col"
      style={{ padding: '18px 16px', gap: '12px' }}
    >
      <div className="flex items-center justify-center" style={{ height: '120px' }}>
        <img
          src={getPetImage(item.pet.type, item.pet.stage)}
          alt={item.pet.name}
          draggable={false}
          style={{ width: '96px', height: '96px', objectFit: 'contain' }}
        />
      </div>
      <div className="text-center" style={{ gap: '4px' }}>
        <div className="flex items-center justify-center" style={{ gap: '8px' }}>
          <h2 className="text-[16px] font-bold text-text-main" style={{ margin: 0 }}>
            {item.pet.name}
          </h2>
          {item.isDisplayed && (
            <span
              className="text-[11px] font-bold"
              style={{
                color: '#FFFFFF',
                backgroundColor: 'var(--color-accent)',
                borderRadius: '999px',
                padding: '2px 8px',
              }}
            >
              展示中
            </span>
          )}
        </div>
        <div className="text-[13px] text-text-sub" style={{ marginTop: '4px' }}>
          {item.typeLabel} · {item.stageName}
        </div>
      </div>
      <div className="flex" style={{ gap: '8px' }}>
        <button
          type="button"
          onClick={onRename}
          disabled={busy}
          className="flex-1 font-semibold rounded-[12px] active:scale-[0.98] transition-transform disabled:opacity-40"
          style={{
            height: '44px',
            border: 'none',
            backgroundColor: 'var(--color-input-bg)',
            color: 'var(--color-text-main)',
          }}
        >
          改名
        </button>
        {!item.isDisplayed && (
          <button
            type="button"
            onClick={onSetDisplayed}
            disabled={busy}
            className="flex-1 bg-accent text-white font-semibold rounded-[12px] shadow-clay-button active:scale-[0.98] transition-transform disabled:opacity-40"
            style={{ height: '44px', border: 'none' }}
          >
            设为展示
          </button>
        )}
      </div>
    </article>
  )
}
