import { addDays, isoWeekday, type ISODate } from './dates'
import { isBusinessDay } from './businessDays'
import { ACTIVE_STATUSES, PERIODS, RULES } from './rules'
import type { DayPeriod, RequestedDay, TeleworkRequest, WeeklySlot } from './types'

/** Les types régulier et mixte suivent un rythme hebdomadaire. */
export function hasRhythm(request: Pick<TeleworkRequest, 'type'>): boolean {
  return request.type === 'regular' || request.type === 'mixed'
}

function periodWeight(period: DayPeriod): number {
  return PERIODS[period].weight
}

export function countDays(days: readonly RequestedDay[]): number {
  return days.reduce((total, day) => total + periodWeight(day.period), 0)
}

export function countWeeklyDays(slots: readonly WeeklySlot[]): number {
  return slots.reduce((total, slot) => total + periodWeight(slot.period), 0)
}

interface Balance {
  allowance: number
  pending: number
  available: number
}

/** Solde de télétravail occasionnel pour l'année `year`. */
export function occasionalBalance(
  requests: readonly TeleworkRequest[],
  employeeId: string,
  year: number,
): Balance {
  let approved = 0
  let pending = 0
  for (const request of requests) {
    if (request.employeeId !== employeeId) continue
    if (request.type !== 'occasional' && request.type !== 'mixed') continue
    const days = countDays(request.days.filter((d) => d.date.startsWith(`${year}-`)))
    if (request.status === 'approved') approved += days
    if (request.status === 'pending') pending += days
  }
  const allowance = RULES.occasionalAllowancePerYear
  return { allowance, pending, available: Math.max(0, allowance - approved - pending) }
}

interface DayEntry {
  date: ISODate
  period: DayPeriod
  request: TeleworkRequest
}

/** Ce qui est prévu pour un collaborateur à une date donnée, demandes actives seulement. */
export function entryFor(
  requests: readonly TeleworkRequest[],
  employeeId: string,
  date: ISODate,
): DayEntry | null {
  if (!isBusinessDay(date)) return null
  let regular: DayEntry | null = null
  for (const request of requests) {
    if (request.employeeId !== employeeId || !ACTIVE_STATUSES.includes(request.status)) continue
    if (hasRhythm(request) && request.startDate && date >= request.startDate) {
      if (!request.endDate || date <= request.endDate) {
        const slot = request.weeklySlots.find((s) => s.weekday === isoWeekday(date))
        if (slot && !regular) regular = { date, period: slot.period, request }
      }
    }
    // Un jour ponctuel prime sur le rythme régulier.
    const day = request.days.find((d) => d.date === date)
    if (day) return { date, period: day.period, request }
  }
  return regular
}

/** Prochaine journée de télétravail à partir de `from` (incluse). */
export function nextTeleworkDay(
  requests: readonly TeleworkRequest[],
  employeeId: string,
  from: ISODate,
): DayEntry | null {
  for (let i = 0; i <= RULES.searchHorizonDays; i++) {
    const entry = entryFor(requests, employeeId, addDays(from, i))
    if (entry) return entry
  }
  return null
}
