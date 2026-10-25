import { type ISODate } from './dates'
import { holidayName } from './holidays'
import { searchDirectory } from './directory'
import { PERIODS } from './rules'
import { entryFor } from './schedule'
import type { Employee, TeleworkRequest } from './types'

export type PlanningCellKind = 'office' | 'remote' | 'pending' | 'holiday'

interface PlanningCell {
  kind: PlanningCellKind
  label: string
}

export interface PlanningRow {
  member: Employee
  cells: PlanningCell[]
}

function planningCell(
  requests: readonly TeleworkRequest[],
  memberId: string,
  date: ISODate,
): PlanningCell {
  if (holidayName(date)) return { kind: 'holiday', label: 'Férié' }
  const entry = entryFor(requests, memberId, date)
  if (!entry) return { kind: 'office', label: 'Sur site' }
  const period = entry.period === 'day' ? '' : ` ${PERIODS[entry.period].short}`
  return entry.request.status === 'pending'
    ? { kind: 'pending', label: `À valider${period}` }
    : { kind: 'remote', label: `Télétravail${period}` }
}

/** Une ligne par collaborateur, une case par jour de la semaine. */
export function planningRows(
  members: readonly Employee[],
  requests: readonly TeleworkRequest[],
  days: readonly ISODate[],
): PlanningRow[] {
  return members.map((member) => ({
    member,
    cells: days.map((date) => planningCell(requests, member.id, date)),
  }))
}

/** Nombre de collaborateurs à distance (demande validée) le jour d'index donné. */
export function remoteCountAt(rows: readonly PlanningRow[], index: number): number {
  return rows.filter((r) => r.cells[index]?.kind === 'remote').length
}

export function filterPlanningRows(
  rows: readonly PlanningRow[],
  members: readonly Employee[],
  query: string,
  team: string,
): PlanningRow[] {
  const found = new Set(searchDirectory(members, query).map((m) => m.id))
  return rows.filter((r) => found.has(r.member.id) && (team === 'all' || r.member.team === team))
}

export function teamNames(members: readonly Employee[]): string[] {
  return [...new Set(members.map((m) => m.team))].sort((a, b) => a.localeCompare(b, 'fr'))
}

/** Noms des demandes à valider en masse : cinq au plus, puis « et N autres ». */
export function namesSummary(names: readonly string[]): string {
  const shown = names.slice(0, 5).join(', ')
  return names.length > 5 ? `${shown} et ${names.length - 5} autres.` : `${shown}.`
}
