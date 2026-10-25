import type { ISODate } from '../dates'
import type { Employee, TeleworkRequest } from '../types'

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
    // Manager qui a saisi la demande à la place du collaborateur.
    enteredBy?: string
    submittedOn: ISODate
    decidedOn?: ISODate
    decisionComment?: string
  }
