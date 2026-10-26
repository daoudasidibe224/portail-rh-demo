import type { ISODate } from '../dates'
import type { Employee, TeleworkRequest } from '../types'
import { buildEmployee, buildRequest, createCalendar } from './build'
import { EMPLOYEE_SEEDS } from './employees'
import { requestSeeds } from './requests'

export interface PortalState {
  version: 1
  currentUserId: string
  employees: Employee[]
  requests: TeleworkRequest[]
  sequence: number
}

export function isPortalState(value: unknown): value is PortalState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<PortalState>
  return (
    candidate.version === 1 &&
    typeof candidate.currentUserId === 'string' &&
    Array.isArray(candidate.employees) &&
    Array.isArray(candidate.requests) &&
    typeof candidate.sequence === 'number'
  )
}

/**
 * Données de démonstration, calculées par rapport à la date du jour pour que la démo
 * reste cohérente quel que soit le jour où on l'ouvre.
 */
export function createSeed(today: ISODate): PortalState {
  const calendar = createCalendar(today)
  const employees = EMPLOYEE_SEEDS.map((seed) => buildEmployee(seed, calendar.year))
  const requests = requestSeeds(calendar).map((seed, index) =>
    buildRequest(seed, index + 1, calendar.year, employees),
  )

  return {
    version: 1,
    currentUserId: 'e-camille',
    employees,
    requests,
    sequence: requests.length,
  }
}
