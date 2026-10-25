import type { Employee, HistoryEvent, TeleworkRequest } from './types'

type Decision = Exclude<HistoryEvent['action'], 'submitted'>

interface TransitionContext {
  actorId: string
  // Collaborateur qui a fait la demande.
  author: Employee | undefined
  comment?: string
}

/** Lève une erreur si `actorId` ne peut pas appliquer cette décision à la demande. */
export function assertCanTransition(
  request: TeleworkRequest,
  action: Decision,
  { actorId, author, comment }: TransitionContext,
): void {
  if (author?.managerId !== actorId) throw new Error('Action non autorisée')
  if (request.status !== 'pending') throw new Error('Cette demande a déjà été traitée')
  if (action === 'rejected' && !comment?.trim()) throw new Error('Un motif de refus est requis')
}
