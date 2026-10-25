import { addDays, isWeekend, type ISODate } from './dates'
import { holidayName } from './holidays'

export function isBusinessDay(iso: ISODate): boolean {
  return !isWeekend(iso) && holidayName(iso) === undefined
}

// Strictement après `iso`.
export function nextBusinessDay(iso: ISODate): ISODate {
  let candidate = addDays(iso, 1)
  while (!isBusinessDay(candidate)) candidate = addDays(candidate, 1)
  return candidate
}

export function addBusinessDays(iso: ISODate, n: number): ISODate {
  let current = iso
  for (let i = 0; i < n; i++) current = nextBusinessDay(current)
  return current
}
