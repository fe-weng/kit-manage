import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'

interface MonthPickerModalProps {
  visible: boolean
  year: number
  month: number
  onSelect: (year: number, month: number) => void
  onClose: () => void
}

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export default function MonthPickerModal({
  visible,
  year,
  month,
  onSelect,
  onClose,
}: MonthPickerModalProps) {
  const [pickerYear, setPickerYear] = useState(year)

  // 同步外部 year 变化
  if (visible && pickerYear !== year) {
    setPickerYear(year)
  }

  const now = useMemo(() => new Date(), [])
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const handleSelect = (m: number) => {
    onSelect(pickerYear, m)
    onClose()
  }

  const isFuture = (m: number) => {
    return pickerYear > currentYear || (pickerYear === currentYear && m > currentMonth)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-clay shadow-float p-5 w-[300px]"
          >
            {/* Year selector */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setPickerYear((y) => y - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
              >
                <CaretLeft size={20} weight="bold" className="text-text-sub" />
              </button>
              <span className="text-heading font-bold text-text-main">{pickerYear}年</span>
              <button
                onClick={() => setPickerYear((y) => Math.min(y + 1, currentYear))}
                disabled={pickerYear >= currentYear}
                className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform disabled:opacity-30"
              >
                <CaretRight size={20} weight="bold" className="text-text-sub" />
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((label, idx) => {
                const m = idx + 1
                const isSelected = pickerYear === year && m === month
                const disabled = isFuture(m)
                return (
                  <button
                    key={m}
                    disabled={disabled}
                    onClick={() => handleSelect(m)}
                    className={`py-2 rounded-xl text-caption font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-white shadow-clay-button'
                        : disabled
                          ? 'text-placeholder'
                          : 'text-text-main hover:bg-input-bg active:bg-border'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-text-sub hover:bg-input-bg"
            >
              <X size={16} weight="bold" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
