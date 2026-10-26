import { addDays, isISODate } from '../dates'
import { formatFull } from '../dateFormat'
import { RULES } from '../rules'
import { countWeeklyDays } from '../schedule'
import type { RequestDraft } from '../types'
import type { Add, ValidationContext } from './types'

/** Rythme hebdomadaire : au moins un jour, délai de prévenance, fin après le début. */
export function validateRegular(draft: RequestDraft, ctx: ValidationContext, add: Add) {
  const perWeek = countWeeklyDays(draft.weeklySlots)
  if (perWeek === 0) {
    add('weeklySlots', 'Choisissez au moins un jour de télétravail dans la semaine.')
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
    if (!isISODate(draft.endDate)) {
      add('endDate', 'La date de fin n’est pas valide : corrigez-la.')
    } else if (draft.endDate <= draft.startDate) {
      add('endDate', 'La date de fin doit être après la date de début.')
    }
  }
}
