import type { DayPeriod, RequestReason, RequestStatus, RequestType, Weekday } from './types'

// Règles métier, reprises de l'ancien formulaire.
export const RULES = {
  occasionalAllowancePerYear: 8,
  regularNoticeDays: 14,
  // Justificatif : PDF de 200 Ko au plus, comme dans l'ancien formulaire.
  attachmentMaxBytes: 200 * 1024,
  // Une journée de 7 h 24, en minutes.
  workMinutesPerDay: 444,
  // Délai maximal annoncé pour la réponse du manager, en jours ouvrés.
  responseBusinessDays: 15,
  charterVersion: 'v5',
  previousCharterVersion: 'v4',
  // Jours examinés pour trouver la prochaine journée de télétravail.
  searchHorizonDays: 60,
} as const

// Pour l'attribut `accept` du champ fichier et pour les messages.
export const ATTACHMENT_ACCEPT = '.pdf'
export const ATTACHMENT_TYPE = 'application/pdf'
export const ATTACHMENT_LABEL = 'PDF'

interface RequestTypeInfo {
  // Code de l'ancien portail, gardé pour le rapprochement côté RH.
  code: string
  label: string
  // Libellé de la liste de choix, identique à l'ancien formulaire.
  choiceLabel: string
  description: string
  rule: string
}

export const REQUEST_TYPES: Record<RequestType, RequestTypeInfo> = {
  regular: {
    code: '41',
    label: 'Régulier',
    choiceLabel: 'TTR – Télétravail régulier (code 41)',
    description: 'Les mêmes jours chaque semaine.',
    rule: `À demander ${RULES.regularNoticeDays} jours à l’avance.`,
  },
  occasional: {
    code: '42',
    label: 'Occasionnel',
    choiceLabel: 'TTO – Télétravail occasionnel (code 42)',
    description: 'Quelques jours ponctuels choisis dans le calendrier.',
    rule: `Décompté de votre solde annuel de ${RULES.occasionalAllowancePerYear} jours.`,
  },
  exceptional: {
    code: '43',
    label: 'Exceptionnel',
    choiceLabel: 'TTE – Télétravail exceptionnel (code 43, formulaire TT-07a)',
    description: 'Grève, intempéries…',
    rule: 'Possible le jour même, non décompté du solde.',
  },
  unused: {
    code: '',
    label: 'Non utilisé',
    choiceLabel: 'TTX – Ne pas utiliser',
    description: 'Ce type est conservé dans la liste mais ne doit pas être utilisé.',
    rule: '',
  },
  absence: {
    code: '',
    label: 'Absence',
    choiceLabel: 'ABS – Absence autre (hors télétravail)',
    description: 'Une absence qui n’est pas du télétravail.',
    rule: 'Elle se déclare dans le service « Absences diverses ».',
  },
  mixed: {
    code: '41 + 42',
    label: 'Mixte',
    choiceLabel: 'TTR+TTO – Mixte (sur dérogation)',
    description: 'Un rythme régulier et des jours occasionnels dans la même demande.',
    rule: 'Sur dérogation. Les jours occasionnels sont décomptés du solde.',
  },
}

// Ordre de l'ancien formulaire.
export const REQUEST_TYPE_ORDER: RequestType[] = [
  'regular',
  'occasional',
  'exceptional',
  'unused',
  'absence',
  'mixed',
]

// Types qui donnent lieu à une demande.
export const SUBMITTABLE_TYPES: readonly RequestType[] = [
  'regular',
  'occasional',
  'exceptional',
  'mixed',
]

export const REASONS: Record<RequestReason, string> = {
  personal: 'Convenance personnelle',
  professional: 'Convenance professionnelle',
  strike: 'Grève des transports',
  weather: 'Intempéries',
  works: 'Travaux au domicile (hors domicile)',
  other: 'Autre (préciser dans le commentaire)',
  unspecified: 'Autre (ne pas préciser)',
}

export const REASON_ORDER: RequestReason[] = [
  'personal',
  'professional',
  'strike',
  'weather',
  'works',
  'other',
  'unspecified',
]

// Centres de coût de l'ancien formulaire (celui du demandeur est présélectionné).
export const COST_CENTERS: { value: string; label: string }[] = [
  { value: 'CC-1001-PAR-A', label: 'CC-1001-PAR-A' },
  { value: 'CC-1001-PAR-B', label: 'CC-1001-PAR-B' },
  { value: 'CC-1002-LYO', label: 'CC-1002-LYO' },
  { value: 'CC-1002-LYO-BIS', label: 'CC-1002-LYO-BIS' },
  { value: 'CC-9999', label: 'CC-9999 (ne pas utiliser)' },
]

// Durée proposée par défaut pour un jour choisi.
export const DEFAULT_PERIOD: DayPeriod = 'day'

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
}

// Statuts dont les jours comptent encore dans le solde.
export const ACTIVE_STATUSES: readonly RequestStatus[] = ['pending', 'approved']
