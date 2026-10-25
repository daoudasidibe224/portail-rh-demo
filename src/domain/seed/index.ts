import type { ISODate } from '../dates'
import { buildEmployee, buildRequest } from './builders'
import { createCalendar } from './calendar'
import { EMPLOYEE_SEEDS } from './employees'
import { requestSeeds } from './requests'
import type { PortalState } from './state'

export { isPortalState, type PortalState } from './state'

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
