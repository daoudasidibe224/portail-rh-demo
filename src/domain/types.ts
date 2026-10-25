import type { ISODate } from './dates'

export type RequestType = 'occasional' | 'regular' | 'exceptional'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type DayPeriod = 'day' | 'am' | 'pm'
export type Weekday = 1 | 2 | 3 | 4 | 5
export type ExceptionalReason = 'strike' | 'weather' | 'pollution' | 'health' | 'other'

export interface RequestedDay {
  date: ISODate
  period: DayPeriod
}

// Créneau d'un télétravail régulier.
export interface WeeklySlot {
  weekday: Weekday
  period: DayPeriod
}

export interface Attachment {
  name: string
  size: number
  type: string
}

// Saisie en cours dans le formulaire.
export interface RequestDraft {
  type: RequestType
  days: RequestedDay[]
  weeklySlots: WeeklySlot[]
  startDate: ISODate | ''
  endDate: ISODate | ''
  reason: ExceptionalReason | ''
  comment: string
  attachment: Attachment | null
  charterAccepted: boolean
}

export interface HistoryEvent {
  at: string
  actorId: string
  action: 'submitted' | 'approved' | 'rejected' | 'cancelled'
  comment?: string
}

export interface TeleworkRequest {
  id: string
  reference: string
  employeeId: string
  type: RequestType
  days: RequestedDay[]
  weeklySlots: WeeklySlot[]
  startDate: ISODate | ''
  endDate: ISODate | ''
  reason: ExceptionalReason | ''
  comment: string
  attachment: Attachment | null
  status: RequestStatus
  createdAt: string
  history: HistoryEvent[]
}

export interface Employee {
  id: string
  matricule: string
  firstName: string
  lastName: string
  jobTitle: string
  team: string
  costCenter: string
  managerId: string | null
  charterAcceptedVersion: string | null
  charterAcceptedAt: string | null
}

export function emptyDraft(type: RequestType = 'occasional'): RequestDraft {
  return {
    type,
    days: [],
    weeklySlots: [],
    startDate: '',
    endDate: '',
    reason: '',
    comment: '',
    attachment: null,
    charterAccepted: false,
  }
}

export function fullName(employee: Pick<Employee, 'firstName' | 'lastName'>): string {
  return `${employee.firstName} ${employee.lastName}`
}

export function initials(employee: Pick<Employee, 'firstName' | 'lastName'>): string {
  return `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase()
}

export type NewsCategory = 'portail' | 'teletravail' | 'vie-entreprise' | 'paie'

// Le corps est une liste de paragraphes en texte brut.
export interface NewsArticle {
  slug: string
  title: string
  summary: string
  publishedAt: ISODate
  category: NewsCategory
  body: string[]
  link?: { label: string; to: string }
}

export type HrServiceGroup = 'paie' | 'absences' | 'documents' | 'carriere'

// Sans `to`, le service ouvre sa page de démonstration.
export interface HrService {
  slug: string
  label: string
  description: string
  group: HrServiceGroup
  to?: string
}
