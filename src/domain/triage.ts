import type { ISODate } from './dates'
import { normalizeText } from './directory'
import { compareBySent } from './requestFilters'
import { entryFor, firstDate } from './schedule'
import type { RequestType, TeleworkRequest } from './types'

type TriageSort = 'start' | 'sent' | 'name'

// Une demande sans date passe en dernier dans le tri par début.
const AFTER_ALL_DATES = '9999-12-31'

export interface TriageFilters {
  query: string
  type: RequestType | 'all'
  sort: TriageSort
}

export const TRIAGE_SORTS: Record<TriageSort, string> = {
  start: 'Début le plus proche',
  sent: 'Envoyée depuis le plus longtemps',
  name: 'Nom (A à Z)',
}

export function triagePending(
  requests: readonly TeleworkRequest[],
  nameOf: (request: TeleworkRequest) => string,
  { query, type, sort }: TriageFilters,
  // Clé du tri par nom (« Nom Prénom »). Par défaut, le nom affiché.
  sortNameOf: (request: TeleworkRequest) => string = nameOf,
): TeleworkRequest[] {
  const needle = normalizeText(query.trim())
  const kept = requests.filter(
    (r) =>
      (type === 'all' || r.type === type) && (!needle || normalizeText(nameOf(r)).includes(needle)),
  )
  const byName = (a: TeleworkRequest, b: TeleworkRequest) =>
    sortNameOf(a).localeCompare(sortNameOf(b), 'fr')
  return kept.sort((a, b) => {
    if (sort === 'name') return byName(a, b)
    if (sort === 'sent') return compareBySent(a, b) || byName(a, b)
    const da = firstDate(a) ?? AFTER_ALL_DATES
    const db = firstDate(b) ?? AFTER_ALL_DATES
    return da.localeCompare(db) || compareBySent(a, b)
  })
}

export function groupByEmployee(
  requests: readonly TeleworkRequest[],
): Map<string, TeleworkRequest[]> {
  const map = new Map<string, TeleworkRequest[]>()
  for (const request of requests) {
    const list = map.get(request.employeeId)
    if (list) list.push(request)
    else map.set(request.employeeId, [request])
  }
  return map
}

/** Collègues déjà à distance (demande validée) le jour demandé. */
export function teammatesRemoteOn(
  byEmployee: ReadonlyMap<string, readonly TeleworkRequest[]>,
  memberIds: readonly string[],
  date: ISODate,
  excludeEmployeeId: string,
): number {
  let count = 0
  for (const id of memberIds) {
    if (id === excludeEmployeeId) continue
    const entry = entryFor(byEmployee.get(id) ?? [], id, date)
    if (entry?.request.status === 'approved') count++
  }
  return count
}
