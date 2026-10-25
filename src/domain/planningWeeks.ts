import { addDays, isISODate, isoWeekNumber, startOfWeek, type ISODate } from './dates'
import { holidayName } from './holidays'
import { entryFor, hasRhythm } from './schedule'
import type { DayPeriod, RequestDraft, TeleworkRequest } from './types'

export const PLANNING_MAX_WEEKS = 6

const WEEK_MS = 7 * 24 * 3600 * 1000

export type PlanningKind = 'office' | 'draft' | 'remote' | 'pending' | 'holiday'

interface PlanningDay {
  date: ISODate
  kind: PlanningKind
  period: DayPeriod
}

interface PlanningWeek {
  monday: ISODate
  number: number
  days: PlanningDay[]
}

export interface Planning {
  weeks: PlanningWeek[]
  // Des jours demandés tombent au-delà des semaines affichées.
  truncated: boolean
}

type PlannedDraft = Pick<RequestDraft, 'type' | 'days' | 'weeklySlots' | 'startDate' | 'endDate'>

/** La saisie en cours, vue comme une demande en attente, pour réutiliser `entryFor`. */
function asRequest(draft: PlannedDraft, employeeId: string): TeleworkRequest {
  const rhythm = hasRhythm(draft)
  return {
    id: 'draft',
    reference: '',
    employeeId,
    type: draft.type,
    days: draft.type === 'regular' ? [] : draft.days,
    weeklySlots: rhythm ? draft.weeklySlots : [],
    startDate: rhythm ? draft.startDate : '',
    endDate: rhythm ? draft.endDate : '',
    reason: '',
    comment: '',
    attachment: null,
    status: 'pending',
    createdAt: '',
    history: [],
  }
}

/**
 * Planning prévisionnel, semaine par semaine, de la première date de la saisie jusqu'à
 * sa dernière (ou {@link PLANNING_MAX_WEEKS} semaines), avec les demandes déjà en cours.
 */
export function planningFor(
  draft: PlannedDraft,
  requests: readonly TeleworkRequest[],
  employeeId: string,
): Planning {
  const rhythm = hasRhythm(draft)
  const dayDates =
    draft.type === 'regular'
      ? []
      : draft.days
          .map((d) => d.date)
          .filter(isISODate)
          .sort()

  const candidates = [...dayDates]
  if (rhythm && isISODate(draft.startDate)) candidates.push(draft.startDate)
  const first = candidates.sort()[0]
  if (!first) return { weeks: [], truncated: false }
  const firstMonday = startOfWeek(first)

  let last: ISODate | undefined = dayDates.at(-1)
  let weekCount = PLANNING_MAX_WEEKS
  // Sans date de fin, un rythme court au-delà de l'aperçu.
  if (!rhythm || isISODate(draft.endDate)) {
    if (rhythm && (!last || draft.endDate > last)) last = draft.endDate
    const span = (Date.parse(startOfWeek(last!)) - Date.parse(firstMonday)) / WEEK_MS
    weekCount = Math.max(1, Math.min(PLANNING_MAX_WEEKS, Math.round(span) + 1))
  }

  const mine = asRequest(draft, employeeId)
  const weeks = Array.from({ length: weekCount }, (_, w) => {
    const monday = addDays(firstMonday, w * 7)
    const days = [0, 1, 2, 3, 4].map((i): PlanningDay => {
      const date = addDays(monday, i)
      if (holidayName(date)) return { date, kind: 'holiday', period: 'day' }
      const planned = entryFor([mine], employeeId, date)
      if (planned) return { date, kind: 'draft', period: planned.period }
      const existing = entryFor(requests, employeeId, date)
      if (existing) {
        const kind = existing.request.status === 'pending' ? 'pending' : 'remote'
        return { date, kind, period: existing.period }
      }
      return { date, kind: 'office', period: 'day' }
    })
    return { monday, number: isoWeekNumber(monday), days }
  })

  const limit = addDays(firstMonday, PLANNING_MAX_WEEKS * 7)
  const truncated =
    dayDates.some((date) => date >= limit) || (rhythm && weekCount === PLANNING_MAX_WEEKS)
  return { weeks, truncated }
}
