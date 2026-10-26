interface StrokeSizeControlsProps {
  brushSize: number
  eraserSize: number
  onBrushSizeChange: (size: number) => void
  onEraserSizeChange: (size: number) => void
}

export const BRUSH_SIZE_MIN = 1
export const BRUSH_SIZE_MAX = 64
export const BRUSH_SIZE_DEFAULT = 28
export const ERASER_SIZE_MIN = 1
export const ERASER_SIZE_MAX = 80
export const ERASER_SIZE_DEFAULT = 36

export default function StrokeSizeControls({
  brushSize,
  eraserSize,
  onBrushSizeChange,
  onEraserSizeChange,
}: StrokeSizeControlsProps) {
  return (
    <div aria-label="画笔粗细" style={{ display: 'flex', flexDirection: 'column' }}>
      <SizeSlider
        label="手涂"
        value={brushSize}
        min={BRUSH_SIZE_MIN}
        max={BRUSH_SIZE_MAX}
        onChange={onBrushSizeChange}
      />
      <SizeSlider
        label="橡皮"
        value={eraserSize}
        min={ERASER_SIZE_MIN}
        max={ERASER_SIZE_MAX}
        onChange={onEraserSizeChange}
      />
    </div>
  )
}

function SizeSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (size: number) => void
}) {
  return (
    <label
      style={{
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        fontWeight: 700,
        color: '#4A4A4A',
      }}
    >
      <span style={{ flex: '0 0 78px' }}>{label} {value} px</span>
      <input
        type="range"
        aria-label={`${label}粗细`}
        aria-valuetext={`${value} 像素`}
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        style={{
          flex: 1,
          minWidth: 0,
          height: '44px',
          margin: 0,
          padding: 0,
          accentColor: '#7ECFC0',
        }}
      />
    </label>
  )
}
