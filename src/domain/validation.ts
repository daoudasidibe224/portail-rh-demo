import {
  addDays,
  addMonths,
  formatFull,
  formatLong,
  holidayName,
  isBusinessDay,
  isISODate,
  isWeekend,
  type ISODate,
} from './dates'
import { formatBytes, formatDays } from './format'
import { ATTACHMENT_LABEL, RULES } from './rules'
import { countDays, countWeeklyDays } from './schedule'
import type { RequestDraft } from './types'

export type FieldKey =
  | 'type'
  | 'days'
  | 'weeklySlots'
  | 'startDate'
  | 'endDate'
  | 'reason'
  | 'comment'
  | 'attachment'
  | 'charter'

export interface ValidationError {
  field: FieldKey
  message: string
}

export interface ValidationContext {
  today: ISODate
  // Jours occasionnels encore disponibles, hors demande en cours.
  availableBalance: number
  // Dates déjà couvertes par une autre demande active.
  bookedDates: ReadonlySet<ISODate>
  charterAlreadyAccepted: boolean
}

/** Valide une saisie ; les messages disent quoi corriger. */
export function validateDraft(draft: RequestDraft, ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = []
  const add: Add = (field, message) => errors.push({ field, message })

  if (draft.type === 'regular') {
    validateRegular(draft, ctx, add)
  } else {
    validateDays(draft, ctx, add)
  }

  if (draft.type === 'exceptional' && !draft.reason) {
    add('reason', 'Choisissez le motif de votre demande exceptionnelle.')
  }
  if (draft.reason === 'other' && draft.type === 'exceptional' && !draft.comment.trim()) {
    add('comment', 'Précisez le motif dans le commentaire.')
  }
  if (draft.comment.length > RULES.commentMaxLength) {
    add(
      'comment',
      `Le commentaire dépasse ${RULES.commentMaxLength} caractères : retirez-en ${draft.comment.length - RULES.commentMaxLength}.`,
    )
  }

  if (draft.attachment) {
    if (!RULES.attachmentTypes.includes(draft.attachment.type)) {
      add('attachment', `Le justificatif doit être au format ${ATTACHMENT_LABEL}.`)
    } else if (draft.attachment.size > RULES.attachmentMaxBytes) {
      add(
        'attachment',
        `Le justificatif pèse ${formatBytes(draft.attachment.size)} : la limite est de ${formatBytes(RULES.attachmentMaxBytes)}.`,
      )
    }
  }

  if (!ctx.charterAlreadyAccepted && !draft.charterAccepted) {
    add('charter', 'Acceptez la charte du télétravail pour envoyer la demande.')
  }

  return errors
}

type Add = (field: FieldKey, message: string) => void

function validateDays(draft: RequestDraft, ctx: ValidationContext, add: Add) {
  if (draft.days.length === 0) {
    add('days', 'Choisissez au moins un jour dans le calendrier.')
    return
  }
  const seen = new Set<ISODate>()
  for (const { date } of draft.days) {
    if (!isISODate(date)) {
      add('days', `La date « ${date} » n’est pas valide.`)
    } else if (date < ctx.today) {
      add('days', `Le ${formatLong(date)} est déjà passé : retirez-le.`)
    } else if (!isBusinessDay(date)) {
      const reason = isWeekend(date) ? 'tombe un week-end' : `est férié (${holidayName(date)})`
      add('days', `Le ${formatLong(date)} ${reason}.`)
    } else if (ctx.bookedDates.has(date)) {
      add('days', `Vous êtes déjà en télétravail ou avez déjà une demande le ${formatLong(date)}.`)
    } else if (seen.has(date)) {
      add('days', `Le ${formatLong(date)} est sélectionné deux fois.`)
    }
    seen.add(date)
  }
  if (draft.type === 'occasional') {
    const requested = countDays(draft.days)
    if (requested > ctx.availableBalance) {
      add(
        'days',
        `Cette demande compte ${formatDays(requested)} mais il vous reste ${formatDays(ctx.availableBalance)} : retirez ${formatDays(requested - ctx.availableBalance)} ou passez par une demande exceptionnelle si elle est justifiée.`,
      )
    }
  }
}

function validateRegular(draft: RequestDraft, ctx: ValidationContext, add: Add) {
  const perWeek = countWeeklyDays(draft.weeklySlots)
  if (perWeek === 0) {
    add('weeklySlots', 'Choisissez au moins un jour de télétravail dans la semaine.')
  } else if (perWeek > RULES.regularMaxDaysPerWeek) {
    add(
      'weeklySlots',
      `Le télétravail régulier est limité à ${formatDays(RULES.regularMaxDaysPerWeek)} par semaine : vous en avez choisi ${formatDays(perWeek)}.`,
    )
  }

  const earliest = addDays(ctx.today, RULES.regularNoticeDays)
  if (!draft.startDate) {
    add('startDate', 'Indiquez la date de début.')
  } else if (!isISODate(draft.startDate)) {
    add('startDate', 'La date de début n’est pas valide : corrigez-la.')
  } else if (draft.startDate < earliest) {
    add(
      'startDate',
      `Le délai de prévenance est de ${RULES.regularNoticeDays} jours : choisissez le ${formatFull(earliest)} ou plus tard.`,
    )
  }

  if (draft.endDate && draft.startDate && isISODate(draft.startDate)) {
    const latest = addMonths(draft.startDate, RULES.regularMaxDurationMonths)
    if (!isISODate(draft.endDate)) {
      add('endDate', 'La date de fin n’est pas valide : corrigez-la.')
    } else if (draft.endDate <= draft.startDate) {
      add('endDate', 'La date de fin doit être après la date de début.')
    } else if (draft.endDate > latest) {
      add(
        'endDate',
        `Une demande régulière dure ${RULES.regularMaxDurationMonths} mois maximum : choisissez le ${formatFull(latest)} ou avant.`,
      )
    }
  }
}

export function errorsFor(errors: readonly ValidationError[], field: FieldKey): string[] {
  return errors.filter((e) => e.field === field).map((e) => e.message)
}
