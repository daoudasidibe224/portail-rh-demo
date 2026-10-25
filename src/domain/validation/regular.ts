import { addDays, addMonths, isISODate } from '../dates'
import { formatFull } from '../dateFormat'
import { formatDays } from '../format'
import { RULES } from '../rules'
import { countWeeklyDays } from '../schedule'
import type { RequestDraft } from '../types'
import type { Add, ValidationContext } from './types'

/** Rythme hebdomadaire : jours par semaine, délai de prévenance et durée maximale. */
export function validateRegular(draft: RequestDraft, ctx: ValidationContext, add: Add) {
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
