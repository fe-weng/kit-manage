import { DayPicker, type DayProps, getDefaultClassNames } from 'react-day-picker'
import { zhCN } from 'date-fns/locale'
import { formatDateStr } from '@/domain/rules/DateUtils'
import 'react-day-picker/style.css'

interface MonthCalendarProps {
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
  getCellStatus?: (date: string) => string | null
  onDayClick?: (date: string) => void
}

function CustomDay({
  getCellStatus,
  onDayClick,
  ...props
}: DayProps & {
  getCellStatus?: (date: string) => string | null
  onDayClick?: (date: string) => void
}) {
  const dateStr = formatDateStr(props.day.date)
  const isToday = dateStr === formatDateStr(new Date())
  const isOutside = props.modifiers.outside
  const status = !isOutside && getCellStatus ? getCellStatus(dateStr) : null

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
        className={`rdp-custom-day ${status ? `rdp-status-${status}` : ''} ${isToday && !status ? 'rdp-today-ring' : ''}`}
        tabIndex={isOutside ? -1 : 0}
      >
        <span className={`rdp-day-number ${isToday ? 'rdp-today-number' : ''}`}>
          {props.day.date.getDate()}
        </span>
      </button>
    </td>
  )
}

export default function MonthCalendar({
  year,
  month,
  onMonthChange,
  getCellStatus,
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
              getCellStatus={getCellStatus}
              onDayClick={onDayClick}
            />
          ),
        }}
      />
    </div>
  )
}
