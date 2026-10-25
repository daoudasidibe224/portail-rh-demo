import { RULES } from '../rules'
import type { Employee, HistoryEvent, TeleworkRequest } from '../types'
import { timestamp } from './calendar'
import type { EmployeeSeed, RequestSeed } from './types'

const DECISION_TIME = '16:40'

export function buildEmployee(seed: EmployeeSeed, year: number): Employee {
  const { charterAccepted, ...fields } = seed
  return {
    ...fields,
    charterAcceptedVersion: RULES.charterVersion,
    charterAcceptedAt: timestamp(`${year}-${charterAccepted.monthDay}`, charterAccepted.time),
  }
}

/** `sequence` est le rang de la demande (à partir de 1) : il donne l'identifiant et la référence. */
export function buildRequest(
  seed: RequestSeed,
  sequence: number,
  year: number,
  employees: readonly Employee[],
): TeleworkRequest {
  const { submittedOn, decidedOn, decisionComment, ...content } = seed
  const submission: HistoryEvent = {
    at: timestamp(submittedOn),
    actorId: seed.employeeId,
    action: 'submitted',
  }
  const decision: HistoryEvent | null =
    seed.status !== 'pending' && decidedOn
      ? {
          at: timestamp(decidedOn, DECISION_TIME),
          actorId: seed.status === 'cancelled' ? seed.employeeId : findManagerId(seed, employees),
          action: seed.status,
          comment: decisionComment,
        }
      : null

  return {
    id: `r-${String(sequence).padStart(4, '0')}`,
    reference: `TT-${year}-${String(sequence).padStart(5, '0')}`,
    days: [],
    weeklySlots: [],
    startDate: '',
    endDate: '',
    reason: '',
    comment: '',
    attachment: null,
    createdAt: submission.at,
    ...content,
    history: decision ? [submission, decision] : [submission],
  }
}

function findManagerId(seed: RequestSeed, employees: readonly Employee[]): string {
  const managerId = employees.find((employee) => employee.id === seed.employeeId)?.managerId
  if (!managerId) throw new Error(`Aucun manager pour valider la demande de ${seed.employeeId}`)
  return managerId
}
