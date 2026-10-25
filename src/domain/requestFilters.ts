import type { ISODate } from './dates'
import { firstDate, hasRhythm } from './schedule'
import type { TeleworkRequest } from './types'

export type RequestSort = 'recent' | 'oldest' | 'start-asc' | 'start-desc'

export const REQUEST_SORTS: Record<RequestSort, string> = {
  recent: 'Envoyée récemment',
  oldest: 'Envoyée il y a longtemps',
  'start-asc': 'Début le plus proche',
  'start-desc': 'Début le plus lointain',
}

export const DEFAULT_REQUEST_SORT: RequestSort = 'recent'

/** La fin précède le début. */
export function isPeriodInverted(from: ISODate | '', to: ISODate | ''): boolean {
  return Boolean(from && to && to < from)
}

/** Au moins une borne, et pas inversée. */
export function isPeriodActive(from: ISODate | '', to: ISODate | ''): boolean {
  return Boolean(from || to) && !isPeriodInverted(from, to)
}

// Bornes incluses ; `''` = sans borne.
function touchesPeriod(request: TeleworkRequest, from: ISODate | '', to: ISODate | ''): boolean {
  if (hasRhythm(request) && request.startDate) {
    // Un rythme régulier court de startDate à endDate, sans fin s'il n'y en a pas.
    const before = Boolean(to && request.startDate > to)
    const after = Boolean(from && request.endDate && request.endDate < from)
    if (!before && !after) return true
  }
  return request.days.some((d) => (!from || d.date >= from) && (!to || d.date <= to))
}

/** Garde les demandes qui touchent la période ; sans borne ou période inversée, ne filtre rien. */
export function filterByPeriod(
  requests: readonly TeleworkRequest[],
  from: ISODate | '',
  to: ISODate | '',
): TeleworkRequest[] {
  if (!isPeriodActive(from, to)) return [...requests]
  return requests.filter((r) => touchesPeriod(r, from, to))
}

export const compareBySent = (a: TeleworkRequest, b: TeleworkRequest) =>
  a.createdAt.localeCompare(b.createdAt)

/** Trie une copie. Pour les tris par début, une demande sans date passe en dernier. */
export function sortRequests(
  requests: readonly TeleworkRequest[],
  key: RequestSort,
): TeleworkRequest[] {
  const copy = [...requests]
  if (key === 'recent') return copy.sort((a, b) => compareBySent(b, a))
  if (key === 'oldest') return copy.sort(compareBySent)
  const direction = key === 'start-asc' ? 1 : -1
  return copy.sort((a, b) => {
    const da = firstDate(a)
    const db = firstDate(b)
    if (da === null || db === null) return da === db ? 0 : da === null ? 1 : -1
    return direction * da.localeCompare(db)
  })
}
