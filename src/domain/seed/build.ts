import { addDays, startOfWeek, type ISODate } from '../dates'
import { RULES } from '../rules'
import type { DayPeriod, Employee, HistoryEvent, RequestedDay, TeleworkRequest } from '../types'
import { isBusinessDay, nextBusinessDay } from '../workdays'

/** Collaborateur tel que décrit dans les données : la charte est datée par jour et mois. */
export type EmployeeSeed = Omit<Employee, 'charterAcceptedVersion' | 'charterAcceptedAt'> & {
  charterAccepted: { monthDay: string; time?: string }
}

type RequestContent = Pick<
  TeleworkRequest,
  'days' | 'weeklySlots' | 'startDate' | 'endDate' | 'reason' | 'comment' | 'attachment'
>

/** Demande telle que décrite dans les données : seuls les champs utiles sont renseignés. */
export type RequestSeed = Pick<TeleworkRequest, 'employeeId' | 'type' | 'status'> &
  Partial<RequestContent> & {
    submittedOn: ISODate
    decidedOn?: ISODate
    decisionComment?: string
  }

const DEFAULT_TIME = '09:12'

/** Repères de dates dont dépendent les demandes de démonstration. */
export interface SeedCalendar {
  today: ISODate
  year: number
  previousMonday: ISODate
  nextMonday: ISODate
}

export function createCalendar(today: ISODate): SeedCalendar {
  const monday = startOfWeek(today)
  return {
    today,
    year: Number(today.slice(0, 4)),
    previousMonday: addDays(monday, -7),
    nextMonday: addDays(monday, 7),
  }
}

function timestamp(date: ISODate, time = DEFAULT_TIME): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

/** Ramène une date fixe sur un jour ouvré, quelle que soit l'année de la démo. */
function onBusinessDay(date: ISODate): ISODate {
  return isBusinessDay(date) ? date : nextBusinessDay(date)
}

export function days(...items: [ISODate, DayPeriod?][]): RequestedDay[] {
  return items.map(([date, period = 'day']) => ({ date: onBusinessDay(date), period }))
}

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
          actorId: findManagerId(seed, employees),
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
