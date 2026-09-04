interface StatusPanelProps {
  mood: number
  moodEmoji: string
  moodLabel: string
  expProgress: number
  stageName: string
  expToNext: number | null
  nextStageName: string | null
}

function ProgressBar({
  label,
  icon,
  value,
  maxValue,
  color,
  hint,
}: {
  label: string
  icon: string
  value: number
  maxValue: number
  color: string
  hint: string
}) {
  const pct = Math.min(100, Math.max(0, (value / maxValue) * 100))

  return (
    <div className="flex flex-col" style={{ gap: '6px' }}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-main">
          {icon} {label}
        </span>
        <span className="text-[12px] text-text-sub">{hint}</span>
      </div>
      <div className="w-full h-3 bg-[#F0E8E0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function StatusPanel({
  mood,
  moodEmoji,
  moodLabel,
  expProgress,
  stageName,
  expToNext,
  nextStageName,
}: StatusPanelProps) {
  return (
    <div
      className="bg-card rounded-[16px] shadow-clay w-full"
      style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* Mood */}
      <ProgressBar
        label="心情"
        icon={moodEmoji}
        value={mood}
        maxValue={100}
        color="#FF9BB0"
        hint={moodLabel}
      />

      {/* Growth / EXP */}
      <ProgressBar
        label="成长"
        icon="⭐"
        value={expProgress * 100}
        maxValue={100}
        color="#FFD54F"
        hint={
          expToNext !== null
            ? `${stageName} → ${nextStageName} 还需 ${expToNext} EXP`
            : `${stageName} ✨ 满级`
        }
      />
    </div>
  )
}
