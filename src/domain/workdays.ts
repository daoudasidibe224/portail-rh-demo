import { addDays, isWeekend, yearOf, type ISODate } from './dates'

// Algorithme de Meeus/Jones/Butcher.
function easterSunday(year: number): ISODate {
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
function frenchHolidays(year: number): Map<ISODate, string> {
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
