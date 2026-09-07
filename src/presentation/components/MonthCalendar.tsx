import { DayPicker, DayButton, type DayButtonProps, getDefaultClassNames, UI, useDayPicker } from 'react-day-picker'
import { zhCN } from 'date-fns/locale'
import { formatDateStr } from '@/domain/rules/DateUtils'
import type { ReactNode } from 'react'
import 'react-day-picker/style.css'

interface MonthCalendarProps {
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
  renderCell?: (date: string) => ReactNode
  onDayClick?: (date: string) => void
}

function CustomDayButton({ renderCell, onDayClick, ...props }: DayButtonProps & {
  renderCell?: (date: string) => ReactNode
  onDayClick?: (date: string) => void
}) {
  const { classNames } = useDayPicker()
  const dateStr = formatDateStr(props.day.date)
  const isToday = dateStr === formatDateStr(new Date())
  const isOutside = props.modifiers.outside

  return (
    <DayButton
      {...props}
      className={`${classNames[UI.DayButton]} rdp-custom-day`}
      onClick={(e) => {
        props.onClick?.(e)
        if (!isOutside) onDayClick?.(dateStr)
      }}
    >
      <span className={`rdp-day-number ${isToday ? 'rdp-today-number' : ''}`}>
        {props.day.date.getDate()}
      </span>
      {!isOutside && renderCell && (
        <span className="rdp-day-indicator">
          {renderCell(dateStr)}
        </span>
      )}
    </DayButton>
  )
}

export default function MonthCalendar({
  year,
  month,
  onMonthChange,
  renderCell,
  onDayClick,
}: MonthCalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  const handleMonthChange = (date: Date) => {
    onMonthChange(date.getFullYear(), date.getMonth() + 1)
  }

  return (
    <div className="month-calendar-wrapper">
      <DayPicker
        month={new Date(year, month - 1)}
        onMonthChange={handleMonthChange}
        locale={zhCN}
        weekStartsOn={1}
        showOutsideDays
        classNames={{
          root: `${defaultClassNames.root} rdp-kid`,
          chevron: `${defaultClassNames.chevron} rdp-kid-chevron`,
        }}
        components={{
          DayButton: (dayBtnProps) => (
            <CustomDayButton
              {...dayBtnProps}
              renderCell={renderCell}
              onDayClick={onDayClick}
            />
          ),
        }}
      />
    </div>
  )
}
