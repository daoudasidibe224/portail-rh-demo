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

export function addMonths(iso: ISODate, months: number): ISODate {
  const date = parseISO(iso)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(day, lastDay))
  return toISO(date)
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

// Algorithme de Meeus/Jones/Butcher.
export function easterSunday(year: number): ISODate {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const holidayCache = new Map<number, Map<ISODate, string>>()

// Jours fériés de métropole, hors Alsace-Moselle.
export function frenchHolidays(year: number): Map<ISODate, string> {
  const cached = holidayCache.get(year)
  if (cached) return cached
  const easter = easterSunday(year)
  const holidays = new Map<ISODate, string>([
    [`${year}-01-01`, 'Jour de l’an'],
    [addDays(easter, 1), 'Lundi de Pâques'],
    [`${year}-05-01`, 'Fête du Travail'],
    [`${year}-05-08`, 'Victoire 1945'],
    [addDays(easter, 39), 'Ascension'],
    [addDays(easter, 50), 'Lundi de Pentecôte'],
    [`${year}-07-14`, 'Fête nationale'],
    [`${year}-08-15`, 'Assomption'],
    [`${year}-11-01`, 'Toussaint'],
    [`${year}-11-11`, 'Armistice 1918'],
    [`${year}-12-25`, 'Noël'],
  ])
  holidayCache.set(year, holidays)
  return holidays
}

export function holidayName(iso: ISODate): string | undefined {
  return frenchHolidays(Number(yearOf(iso))).get(iso)
}

export function isWeekend(iso: ISODate): boolean {
  return isoWeekday(iso) >= 6
}

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

const longFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
const shortFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})
const fullFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const dayMonthFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
// Les horodatages s'affichent dans le fuseau local, contrairement aux dates calendaires.
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })
const timeFormatter = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' })
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

export function yearOf(iso: ISODate): string {
  return iso.slice(0, 4)
}

/** « vendredi 24 octobre » */
export function formatLong(iso: ISODate): string {
  return longFormatter.format(parseISO(iso))
}

/** « ven. 24 oct. » */
export function formatShort(iso: ISODate): string {
  return shortFormatter.format(parseISO(iso))
}

/** « 24 octobre 2026 » */
export function formatFull(iso: ISODate): string {
  return fullFormatter.format(parseISO(iso))
}

/** « 24 octobre » */
export function formatDayMonth(iso: ISODate): string {
  return dayMonthFormatter.format(parseISO(iso))
}

/** « 24 octobre 2026 », à partir d'un horodatage. */
export function formatDate(isoDateTime: string): string {
  return dateFormatter.format(new Date(isoDateTime))
}

/** « 09:12 » */
export function formatTime(isoDateTime: string): string {
  return timeFormatter.format(new Date(isoDateTime))
}

export function formatDateTime(isoDateTime: string): string {
  return dateTimeFormatter.format(new Date(isoDateTime))
}
