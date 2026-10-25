import { addDays } from '../../dates'
import { days, type SeedCalendar } from '../calendar'
import type { RequestSeed } from '../types'

export function myRequestSeeds({
  today,
  year,
  previousMonday,
  nextMonday,
}: SeedCalendar): RequestSeed[] {
  return [
    // Camille : régulier le mercredi, 3,5 j occasionnels validés, 1 j en attente → 3,5 j disponibles.
    {
      employeeId: 'e-camille',
      type: 'regular',
      status: 'approved',
      weeklySlots: [{ weekday: 3, period: 'day' }],
      startDate: `${year}-01-05`,
      submittedOn: `${year - 1}-12-08`,
      decidedOn: `${year - 1}-12-10`,
    },
    {
      employeeId: 'e-camille',
      type: 'occasional',
      status: 'approved',
      days: days([`${year}-02-13`], [`${year}-04-17`, 'am'], [`${year}-06-12`, 'pm']),
      submittedOn: `${year}-02-02`,
      decidedOn: `${year}-02-03`,
    },
    {
      employeeId: 'e-camille',
      type: 'occasional',
      status: 'approved',
      days: days([`${year}-09-11`, 'am'], [`${year}-09-18`]),
      submittedOn: `${year}-09-01`,
      decidedOn: `${year}-09-02`,
    },
    {
      employeeId: 'e-camille',
      type: 'occasional',
      status: 'pending',
      days: days([addDays(nextMonday, 4)]),
      comment: 'Livraison de mobilier prévue le matin.',
      submittedOn: addDays(today, -1),
    },
    {
      employeeId: 'e-camille',
      type: 'exceptional',
      status: 'rejected',
      reason: 'weather',
      days: days([addDays(previousMonday, 1)]),
      submittedOn: addDays(previousMonday, -3),
      decidedOn: addDays(previousMonday, -3),
      decisionComment: 'Vigilance levée la veille au soir, présence nécessaire pour la formation.',
    },
  ]
}
