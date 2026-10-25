import { addDays, startOfWeek, type ISODate } from '../dates'
import { isBusinessDay, nextBusinessDay } from '../businessDays'
import type { DayPeriod, RequestedDay } from '../types'

const DEFAULT_TIME = '09:12'

/** Repères de dates dont dépendent les demandes de démonstration. */
export interface SeedCalendar {
  today: ISODate
  year: number
  previousMonday: ISODate
  nextMonday: ISODate
}

export function createCalendar(today: ISODate): SeedCalendar {
  const monday = startOfWeek(today)
  return {
    today,
    year: Number(today.slice(0, 4)),
    previousMonday: addDays(monday, -7),
    nextMonday: addDays(monday, 7),
  }
}

export function timestamp(date: ISODate, time = DEFAULT_TIME): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

/** Ramène une date fixe sur un jour ouvré, quelle que soit l'année de la démo. */
function onBusinessDay(date: ISODate): ISODate {
  return isBusinessDay(date) ? date : nextBusinessDay(date)
}

export function days(...items: [ISODate, DayPeriod?][]): RequestedDay[] {
  return items.map(([date, period = 'day']) => ({ date: onBusinessDay(date), period }))
}
