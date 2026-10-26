import { useEffect, useRef, useState } from 'react'
import BaseModal from '@/presentation/components/BaseModal'
import { hslToHex, hexToHueLightness, readStoredCustomColor, writeStoredCustomColor } from './customColor'

interface CustomColorSheetProps {
  visible: boolean
  onClose: () => void
  onChange: (hex: string) => void
}

export default function CustomColorSheet({ visible, onClose, onChange }: CustomColorSheetProps) {
  const [hue, setHue] = useState(330)
  const [lightness, setLightness] = useState(55)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!visible) return
    const stored = readStoredCustomColor()
    const parsed = stored ? hexToHueLightness(stored) : null
    const nextHue = parsed?.hue ?? 330
    const nextLightness = parsed?.lightness ?? 55
    const hex = stored && parsed ? stored : hslToHex(nextHue, nextLightness)
    setHue(nextHue)
    setLightness(nextLightness)
    writeStoredCustomColor(hex)
    onChangeRef.current(hex)
  }, [visible])

  const preview = hslToHex(hue, lightness)
  const deep = hslToHex(hue, 18)
  const mid = hslToHex(hue, 52)
  const pale = hslToHex(hue, 88)

  const apply = (nextHue: number, nextLightness: number) => {
    setHue(nextHue)
    setLightness(nextLightness)
    const hex = hslToHex(nextHue, nextLightness)
    writeStoredCustomColor(hex)
    onChangeRef.current(hex)
  }

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      titleId="custom-color-title"
      dialogClassName="max-w-[360px] md:max-w-[420px]"
      dialogStyle={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px 20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      <div className="flex flex-col" style={{ gap: '16px' }}>
        <h2 id="custom-color-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, textAlign: 'center' }}>
          调颜色
        </h2>
        <div
          aria-hidden
          style={{
            height: '72px',
            borderRadius: '18px',
            background: preview,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
          }}
        />
        <label className="flex flex-col" style={{ gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>色相</span>
          <span style={{ position: 'relative', display: 'block', height: '44px' }}>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '13px',
                height: '18px',
                borderRadius: '9px',
                background: 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
              }}
            />
            <input
              type="range"
              min={0}
              max={360}
              value={hue}
              aria-label="色相"
              onChange={(event) => apply(Number(event.target.value), lightness)}
              style={{
                position: 'relative',
                width: '100%',
                height: '44px',
                margin: 0,
                background: 'transparent',
                accentColor: '#4A4A4A',
              }}
            />
          </span>
        </label>
        <label className="flex flex-col" style={{ gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>深浅</span>
          <span style={{ position: 'relative', display: 'block', height: '44px' }}>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '13px',
                height: '18px',
                borderRadius: '9px',
                background: `linear-gradient(90deg, ${deep}, ${mid}, ${pale})`,
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={lightness}
              aria-label="深浅"
              onChange={(event) => apply(hue, Number(event.target.value))}
              style={{
                position: 'relative',
                width: '100%',
                height: '44px',
                margin: 0,
                background: 'transparent',
                accentColor: '#4A4A4A',
              }}
            />
          </span>
        </label>
        <button
          type="button"
          onClick={onClose}
          style={{
            minHeight: '48px',
            border: 'none',
            borderRadius: '14px',
            background: '#7ECFC0',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
          }}
        >
          好了
        </button>
      </div>
    </BaseModal>
  )
}
