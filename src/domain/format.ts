import { formatFull, formatShort } from './dates'
import { PERIODS, REASONS, REQUEST_TYPES, WEEKDAYS } from './rules'
import { countDays, countWeeklyDays } from './schedule'
import type { RequestDraft, TeleworkRequest } from './types'

const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

/** « 1 jour », « 0,5 jour », « 2,5 jours » */
export function formatDays(value: number): string {
  return `${numberFormatter.format(value)} ${value >= 2 ? 'jours' : 'jour'}`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${numberFormatter.format(bytes / 1024)} Ko`
  return `${numberFormatter.format(bytes / 1024 / 1024)} Mo`
}

/** Le mot au pluriel quand `count` dépasse 1 : plural(2, 'demande') donne « demandes ». */
export function plural(count: number, word: string): string {
  return count > 1 ? `${word}s` : word
}

function joinFr(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`
}

type Describable = Pick<RequestDraft, 'type' | 'days' | 'weeklySlots' | 'startDate' | 'endDate'>

export function describeSchedule(request: Describable): string {
  if (request.type === 'regular') {
    const slots = [...request.weeklySlots]
      .sort((a, b) => a.weekday - b.weekday)
      .map((s) => {
        const day = WEEKDAYS[s.weekday].label.toLowerCase()
        return s.period === 'day' ? day : `${day} ${PERIODS[s.period].short}`
      })
    if (slots.length === 0) return 'Aucun jour choisi'
    const from = request.startDate ? ` à partir du ${formatFull(request.startDate)}` : ''
    const to = request.endDate ? ` jusqu’au ${formatFull(request.endDate)}` : ''
    return `Chaque ${joinFr(slots)}${from}${to}`
  }
  const days = [...request.days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) =>
      d.period === 'day'
        ? formatShort(d.date)
        : `${formatShort(d.date)} (${PERIODS[d.period].short})`,
    )
  return days.length ? joinFr(days) : 'Aucune date choisie'
}

export function describeQuantity(request: Describable): string {
  if (request.type === 'regular')
    return `${formatDays(countWeeklyDays(request.weeklySlots))} par semaine`
  return formatDays(countDays(request.days))
}

export function describeType(request: Pick<TeleworkRequest, 'type' | 'reason'>): string {
  const label = `Télétravail ${REQUEST_TYPES[request.type].label.toLowerCase()}`
  return request.type === 'exceptional' && request.reason
    ? `${label} (${REASONS[request.reason].toLowerCase()})`
    : label
}
