// Dates calendaires `YYYY-MM-DD`. Les calculs passent par UTC pour éviter les décalages d'heure d'été.
export type ISODate = string

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 86_400_000

export function isISODate(value: string): value is ISODate {
  if (!ISO_PATTERN.test(value)) return false
  return toISO(parseISO(value)) === value
}

export function parseISO(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d))
}

function toISO(date: Date): ISODate {
  return date.toISOString().slice(0, 10)
}

// Jour local de l'utilisateur, pas celui d'UTC.
export function todayISO(now: Date = new Date()): ISODate {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(iso: ISODate, days: number): ISODate {
  return toISO(new Date(parseISO(iso).getTime() + days * DAY_MS))
}

function diffDays(from: ISODate, to: ISODate): number {
  return Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / DAY_MS)
}

// 1 = lundi, 7 = dimanche.
export function isoWeekday(iso: ISODate): number {
  const day = parseISO(iso).getUTCDay()
  return day === 0 ? 7 : day
}

export function startOfWeek(iso: ISODate): ISODate {
  return addDays(iso, 1 - isoWeekday(iso))
}

export function isoWeekNumber(iso: ISODate): number {
  const thursday = addDays(iso, 4 - isoWeekday(iso))
  const yearStart = `${yearOf(thursday)}-01-01`
  return Math.floor(diffDays(yearStart, thursday) / 7) + 1
}

export function isWeekend(iso: ISODate): boolean {
  return isoWeekday(iso) >= 6
}

export function yearOf(iso: ISODate): string {
  return iso.slice(0, 4)
}
