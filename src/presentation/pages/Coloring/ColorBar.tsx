import { Palette } from '@phosphor-icons/react'
import { FIXED_COLORS } from '@/domain/coloring/palette'

interface ColorBarProps {
  color: string
  usingCustom: boolean
  customColor: string
  onSelect: (color: string) => void
  onOpenCustom: () => void
}

export default function ColorBar({
  color,
  usingCustom,
  customColor,
  onSelect,
  onOpenCustom,
}: ColorBarProps) {
  return (
    <div
      className="flex items-center overflow-x-auto"
      style={{ gap: '6px', padding: '4px 2px 2px', WebkitOverflowScrolling: 'touch' }}
    >
      {FIXED_COLORS.map((swatch) => {
        const selected = !usingCustom && color === swatch
        return (
          <button
            key={swatch}
            type="button"
            aria-label={`颜色 ${swatch}`}
            aria-pressed={selected}
            onClick={() => onSelect(swatch)}
            style={{
              flex: '0 0 auto',
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              border: selected ? '3px solid #4A4A4A' : '3px solid transparent',
              background: swatch,
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
              padding: 0,
            }}
          />
        )
      })}
      <button
        type="button"
        aria-label="自由调色"
        aria-pressed={usingCustom}
        onClick={onOpenCustom}
        style={{
          flex: '0 0 auto',
          width: '44px',
          height: '44px',
          borderRadius: '22px',
          border: usingCustom ? '3px solid #4A4A4A' : '3px solid transparent',
          background: `conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
          padding: '4px',
        }}
      >
        <span
          className="flex items-center justify-center"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: customColor,
          }}
        >
          <Palette size={16} weight="fill" color="#4A4A4A" />
        </span>
      </button>
    </div>
  )
}
