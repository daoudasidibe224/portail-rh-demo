import type { ISODate } from '../dates'

export type FieldKey =
  | 'person'
  | 'type'
  | 'days'
  | 'weeklySlots'
  | 'startDate'
  | 'endDate'
  | 'reason'
  | 'comment'
  | 'attachment'
  | 'charter'
  | 'connection'

export interface ValidationError {
  field: FieldKey
  message: string
}

export interface ValidationContext {
  today: ISODate
  // Jours occasionnels encore disponibles, hors demande en cours.
  availableBalance: number
  charterAlreadyAccepted: boolean
  // Matricules déjà présents dans le portail, pour refuser un doublon.
  knownMatricules: ReadonlySet<string>
}

/** Ajoute une erreur sur un champ. */
export type Add = (field: FieldKey, message: string) => void
