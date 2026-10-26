import { isISODate, isWeekend, type ISODate } from '../dates'
import { holidayName, isBusinessDay } from '../workdays'
import { formatLong } from '../dateFormat'
import { formatDays } from '../format'
import { countDays } from '../schedule'
import type { RequestDraft } from '../types'
import type { Add, ValidationContext } from './types'

/** Jours ponctuels : au moins un, ouvrés, à venir, libres, dans la limite du solde. */
export function validateDays(draft: RequestDraft, ctx: ValidationContext, add: Add) {
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
    } else if (seen.has(date)) {
      add('days', `Le ${formatLong(date)} est sélectionné deux fois.`)
    }
    seen.add(date)
  }
  if (draft.type === 'occasional' || draft.type === 'mixed') {
    const requested = countDays(draft.days)
    if (requested > ctx.availableBalance) {
      add(
        'days',
        `Cette demande compte ${formatDays(requested)} mais votre solde disponible est de ${formatDays(ctx.availableBalance)} : retirez ${formatDays(requested - ctx.availableBalance)} ou faites une demande de télétravail exceptionnel si votre situation le justifie.`,
      )
    }
  }
}
