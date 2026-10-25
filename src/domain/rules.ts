import type { DayPeriod, ExceptionalReason, RequestStatus, RequestType, Weekday } from './types'

// Règles métier. Valeurs du portail historique, à confirmer avec les RH.
const ATTACHMENT_FORMATS = [
  { type: 'application/pdf', label: 'PDF', extensions: ['.pdf'] },
  { type: 'image/jpeg', label: 'JPG', extensions: ['.jpg', '.jpeg'] },
  { type: 'image/png', label: 'PNG', extensions: ['.png'] },
]

export const RULES = {
  occasionalAllowancePerYear: 8,
  regularNoticeDays: 14,
  regularMaxDaysPerWeek: 2,
  regularMaxDurationMonths: 12,
  commentMaxLength: 500,
  attachmentMaxBytes: 2 * 1024 * 1024,
  attachmentTypes: ATTACHMENT_FORMATS.map((format) => format.type) as readonly string[],
  charterVersion: 'v5',
  previousCharterVersion: 'v4',
  // Jours examinés pour trouver la prochaine journée de télétravail.
  searchHorizonDays: 60,
} as const

// Pour l'attribut `accept` du champ fichier et pour les messages.
export const ATTACHMENT_ACCEPT = ATTACHMENT_FORMATS.flatMap((f) => f.extensions).join(',')
export const ATTACHMENT_LABEL = `${ATTACHMENT_FORMATS.slice(0, -1)
  .map((f) => f.label)
  .join(', ')} ou ${ATTACHMENT_FORMATS.at(-1)!.label}`

interface RequestTypeInfo {
  label: string
  description: string
  rule: string
}

export const REQUEST_TYPES: Record<RequestType, RequestTypeInfo> = {
  occasional: {
    label: 'Occasionnel',
    description: 'Quelques jours ponctuels choisis dans le calendrier.',
    rule: `Décompté de votre solde annuel de ${RULES.occasionalAllowancePerYear} jours.`,
  },
  regular: {
    label: 'Régulier',
    description: 'Les mêmes jours chaque semaine.',
    rule: `Jusqu’à ${RULES.regularMaxDaysPerWeek} jours par semaine, à demander ${RULES.regularNoticeDays} jours à l’avance.`,
  },
  exceptional: {
    label: 'Exceptionnel',
    description: 'Grève, intempéries, pic de pollution…',
    rule: 'Possible le jour même, non décompté du solde.',
  },
}

export const REASONS: Record<ExceptionalReason, string> = {
  strike: 'Grève des transports',
  weather: 'Intempéries',
  pollution: 'Pic de pollution',
  health: 'Raison de santé (sur avis médical)',
  other: 'Autre motif',
}

export const PERIODS: Record<DayPeriod, { label: string; short: string; weight: number }> = {
  day: { label: 'Journée', short: 'journée', weight: 1 },
  am: { label: 'Matin', short: 'matin', weight: 0.5 },
  pm: { label: 'Après-midi', short: 'après-midi', weight: 0.5 },
}

export const WEEKDAYS: Record<Weekday, { label: string; short: string }> = {
  1: { label: 'Lundi', short: 'lun.' },
  2: { label: 'Mardi', short: 'mar.' },
  3: { label: 'Mercredi', short: 'mer.' },
  4: { label: 'Jeudi', short: 'jeu.' },
  5: { label: 'Vendredi', short: 'ven.' },
}

export const STATUSES: Record<RequestStatus, { label: string }> = {
  pending: { label: 'En attente' },
  approved: { label: 'Validée' },
  rejected: { label: 'Refusée' },
  cancelled: { label: 'Annulée' },
}

// Statuts dont les jours comptent encore dans le solde.
export const ACTIVE_STATUSES: readonly RequestStatus[] = ['pending', 'approved']
