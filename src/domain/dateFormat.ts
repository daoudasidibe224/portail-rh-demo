import { parseISO, type ISODate } from './dates'

// Affichage des dates en français.
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
