import { formatFull, formatShort } from './dateFormat'
import { PERIODS, REASONS, REQUEST_TYPES, RULES, WEEKDAYS } from './rules'
import { countDays, countWeeklyDays } from './schedule'
import type { RequestDraft, TeleworkRequest } from './types'

const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

/** « 1 jour », « 0,5 jour », « 2,5 jours » */
export function formatDays(value: number): string {
  return `${numberFormatter.format(value)} ${value >= 2 ? 'jours' : 'jour'}`
}

/** Équivalent en heures : 1 jour = 7 h 24, donc 3,5 jours = « 25 h 54 ». */
export function formatHours(days: number): string {
  const total = Math.round(days * RULES.workMinutesPerDay)
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return minutes ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${hours} h`
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

function describeRhythm(request: Describable): string {
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

function describeDays(request: Describable): string {
  const days = [...request.days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) =>
      d.period === 'day'
        ? formatShort(d.date)
        : `${formatShort(d.date)} (${PERIODS[d.period].short})`,
    )
  return days.length ? joinFr(days) : 'Aucune date choisie'
}

export function describeSchedule(request: Describable): string {
  if (request.type === 'regular') return describeRhythm(request)
  if (request.type === 'mixed') return `${describeRhythm(request)}, et ${describeDays(request)}`
  return describeDays(request)
}

export function describeQuantity(request: Describable): string {
  const weekly = `${formatDays(countWeeklyDays(request.weeklySlots))} par semaine`
  if (request.type === 'regular') return weekly
  if (request.type === 'mixed') return `${weekly}, plus ${formatDays(countDays(request.days))}`
  return formatDays(countDays(request.days))
}

export function describeType(request: Pick<TeleworkRequest, 'type' | 'reason'>): string {
  const label = `Télétravail ${REQUEST_TYPES[request.type].label.toLowerCase()}`
  return request.type === 'exceptional' && request.reason && request.reason !== 'unspecified'
    ? `${label} (${REASONS[request.reason].toLowerCase()})`
    : label
}
