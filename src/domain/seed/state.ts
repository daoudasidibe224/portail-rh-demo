import type { Employee, TeleworkRequest } from '../types'

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
