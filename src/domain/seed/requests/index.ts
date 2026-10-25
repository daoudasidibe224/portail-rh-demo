import type { SeedCalendar } from '../calendar'
import type { RequestSeed } from '../types'
import { myRequestSeeds } from './myRequests'
import { teamRequestSeeds } from './teamRequests'

/**
 * L'ordre fixe les identifiants et les références (r-0001, TT-2026-00001…).
 * Les dates fixes suivent l'année de la démo, les autres sont relatives à aujourd'hui.
 */
export function requestSeeds(calendar: SeedCalendar): RequestSeed[] {
  return [...myRequestSeeds(calendar), ...teamRequestSeeds(calendar)]
}
