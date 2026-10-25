import type { ISODate } from './dates'
import { isOngoing } from './schedule'
import type { Employee, HistoryEvent, TeleworkRequest } from './types'

type Decision = Exclude<HistoryEvent['action'], 'submitted'>

interface TransitionContext {
  actorId: string
  today: ISODate
  // Collaborateur qui a fait la demande.
  author: Employee | undefined
  comment?: string
}

/** Lève une erreur si `actorId` ne peut pas appliquer cette décision à la demande. */
export function assertCanTransition(
  request: TeleworkRequest,
  action: Decision,
  { actorId, today, author, comment }: TransitionContext,
): void {
  if (action === 'cancelled') {
    if (request.employeeId !== actorId) throw new Error('Action non autorisée')
    if (!isOngoing(request, today)) throw new Error('Cette demande ne peut plus être annulée')
    return
  }
  if (author?.managerId !== actorId) throw new Error('Action non autorisée')
  if (request.status !== 'pending') throw new Error('Cette demande a déjà été traitée')
  if (action === 'rejected' && !comment?.trim()) throw new Error('Un motif de refus est requis')
}
