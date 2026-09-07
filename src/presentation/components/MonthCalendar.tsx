import { DayPicker, type DayProps, getDefaultClassNames } from 'react-day-picker'
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

function CustomDay({
  renderCell,
  onDayClick,
  ...props
}: DayProps & {
  renderCell?: (date: string) => ReactNode
  onDayClick?: (date: string) => void
}) {
  const dateStr = formatDateStr(props.day.date)
  const isToday = dateStr === formatDateStr(new Date())
  const isOutside = props.modifiers.outside

  return (
    <td
      {...props}
      className={`rdp-day ${isOutside ? 'rdp-outside' : ''}`}
      role="gridcell"
      onClick={() => {
        if (!isOutside) onDayClick?.(dateStr)
      }}
    >
      <button
        type="button"
        className="rdp-custom-day"
        tabIndex={isOutside ? -1 : 0}
      >
        <span className={`rdp-day-number ${isToday ? 'rdp-today-number' : ''}`}>
          {props.day.date.getDate()}
        </span>
        {!isOutside && renderCell && (
          <span className="rdp-day-indicator">
            {renderCell(dateStr)}
          </span>
        )}
      </button>
    </td>
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
          Day: (dayProps) => (
            <CustomDay
              {...dayProps}
              renderCell={renderCell}
              onDayClick={onDayClick}
            />
          ),
        }}
      />
    </div>
  )
}
