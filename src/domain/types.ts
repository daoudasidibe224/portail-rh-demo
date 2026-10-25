import type { ISODate } from './dates'

// `absence` et `unused` existent dans la liste de l'ancien formulaire, mais ne s'envoient pas ici.
export type RequestType = 'occasional' | 'regular' | 'exceptional' | 'mixed' | 'absence' | 'unused'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type DayPeriod = 'day' | 'am' | 'pm'
export type Weekday = 1 | 2 | 3 | 4 | 5
export type RequestReason =
  'personal' | 'professional' | 'strike' | 'weather' | 'works' | 'other' | 'unspecified'

export interface RequestedDay {
  date: ISODate
  period: DayPeriod
}

// Créneau d'un télétravail régulier.
export interface WeeklySlot {
  weekday: Weekday
  period: DayPeriod
}

interface Attachment {
  name: string
  size: number
  type: string
}

/** Pour qui la demande est faite : soi, un membre de son équipe, ou une personne saisie à la main. */
export type OnBehalfKind = 'self' | 'member' | 'other'

export interface OnBehalf {
  kind: OnBehalfKind
  // Membre choisi, quand `kind` vaut `member`.
  employeeId: string
  // Personne saisie à la main, quand `kind` vaut `other`.
  matricule: string
  firstName: string
  lastName: string
}

export function emptyOnBehalf(kind: OnBehalfKind = 'self'): OnBehalf {
  return { kind, employeeId: '', matricule: '', firstName: '', lastName: '' }
}

// Saisie en cours dans le formulaire.
export interface RequestDraft {
  // Réservé aux managers ; `self` pour tous les autres.
  onBehalf: OnBehalf
  type: RequestType
  days: RequestedDay[]
  weeklySlots: WeeklySlot[]
  startDate: ISODate | ''
  endDate: ISODate | ''
  reason: RequestReason | ''
  // Vide : le centre de coût du demandeur.
  costCenter: string
  comment: string
  attachment: Attachment | null
  charterAccepted: boolean
  // Attestation d'une connexion stable au domicile, demandée à chaque envoi.
  connectionConfirmed: boolean
  // Accord pour que le service RH recontacte le demandeur au sujet de la demande.
  recontactAllowed: boolean
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
  reason: RequestReason | ''
  comment: string
  attachment: Attachment | null
  // Absents des demandes enregistrées avant l'ajout de ces champs.
  costCenter?: string
  recontactAllowed?: boolean
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
    onBehalf: emptyOnBehalf(),
    type,
    days: [],
    weeklySlots: [],
    startDate: '',
    endDate: '',
    reason: '',
    costCenter: '',
    comment: '',
    attachment: null,
    charterAccepted: false,
    connectionConfirmed: false,
    recontactAllowed: false,
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
