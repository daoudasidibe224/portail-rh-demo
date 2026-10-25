import { yearOf } from './dates'
import type { Employee, HistoryEvent, RequestDraft, TeleworkRequest } from './types'

export function historyEvent(
  actorId: string,
  action: HistoryEvent['action'],
  comment?: string,
  now: Date = new Date(),
): HistoryEvent {
  return {
    at: now.toISOString(),
    actorId,
    action,
    ...(comment ? { comment } : {}),
  }
}

const padded = (sequence: number, width: number) => String(sequence).padStart(width, '0')

/** Collaborateur créé à partir d'une personne saisie à la main : elle rejoint l'équipe du manager. */
export function employeeFromDraft(
  draft: RequestDraft,
  manager: Employee,
  sequence: number,
): Employee {
  return {
    id: `e-ext-${padded(sequence, 4)}`,
    matricule: draft.onBehalf.matricule,
    firstName: draft.onBehalf.firstName.trim(),
    lastName: draft.onBehalf.lastName.trim().toUpperCase(),
    jobTitle: 'Collaborateur',
    team: manager.team,
    costCenter: draft.costCenter || manager.costCenter,
    managerId: manager.id,
    charterAcceptedVersion: null,
    charterAcceptedAt: null,
  }
}

interface RequestContext {
  sequence: number
  today: string
  employeeId: string
  // Auteur de la saisie : le demandeur, ou son manager.
  actorId: string
  defaultCostCenter: string
  // Un manager qui saisit pour son équipe valide la demande en même temps.
  enteredByManager: boolean
  now?: Date
}

/** Demande prête à être enregistrée, à partir d'une saisie déjà validée. */
export function requestFromDraft(draft: RequestDraft, ctx: RequestContext): TeleworkRequest {
  const now = ctx.now ?? new Date()
  const rhythm = draft.type === 'regular' || draft.type === 'mixed'
  return {
    id: `r-${padded(ctx.sequence, 4)}-${now.getTime().toString(36)}`,
    reference: `TT-${yearOf(ctx.today)}-${padded(ctx.sequence, 5)}`,
    employeeId: ctx.employeeId,
    type: draft.type,
    days:
      draft.type === 'regular' ? [] : [...draft.days].sort((a, b) => a.date.localeCompare(b.date)),
    weeklySlots: rhythm ? [...draft.weeklySlots].sort((a, b) => a.weekday - b.weekday) : [],
    startDate: rhythm ? draft.startDate : '',
    endDate: rhythm ? draft.endDate : '',
    reason: draft.reason,
    costCenter: draft.costCenter || ctx.defaultCostCenter,
    comment: draft.comment.trim(),
    attachment: draft.attachment,
    recontactAllowed: draft.recontactAllowed,
    status: ctx.enteredByManager ? 'approved' : 'pending',
    createdAt: now.toISOString(),
    history: ctx.enteredByManager
      ? [
          historyEvent(ctx.actorId, 'submitted', 'Saisie par le manager', now),
          historyEvent(ctx.actorId, 'approved', undefined, now),
        ]
      : [historyEvent(ctx.actorId, 'submitted', undefined, now)],
  }
}
