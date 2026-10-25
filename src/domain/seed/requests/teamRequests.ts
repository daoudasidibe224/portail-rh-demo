import { addBusinessDays } from '../../businessDays'
import { addDays } from '../../dates'
import { days, type SeedCalendar } from '../calendar'
import type { RequestSeed } from '../types'

const SIX_MONTHS_IN_DAYS = 182

/** Demandes à valider par Camille, et planning existant de son équipe. */
export function teamRequestSeeds({ today, year, nextMonday }: SeedCalendar): RequestSeed[] {
  const regularStart = addDays(nextMonday, 21)

  return [
    {
      employeeId: 'e-leo',
      type: 'occasional',
      status: 'pending',
      days: days([addDays(nextMonday, 1)], [addDays(nextMonday, 3), 'am']),
      comment: 'Rendez-vous médical en fin de matinée le jeudi.',
      submittedOn: addDays(today, -2),
    },
    {
      employeeId: 'e-ines',
      type: 'regular',
      status: 'pending',
      weeklySlots: [
        { weekday: 1, period: 'day' },
        { weekday: 4, period: 'day' },
      ],
      startDate: regularStart,
      endDate: addDays(regularStart, SIX_MONTHS_IN_DAYS),
      comment: 'Déménagement à Melun, 1 h 20 de trajet.',
      submittedOn: addDays(today, -1),
    },
    {
      employeeId: 'e-hugo',
      type: 'exceptional',
      status: 'pending',
      reason: 'strike',
      days: days([addBusinessDays(today, 1)]),
      attachment: { name: 'preavis-greve-rer.pdf', size: 184_320, type: 'application/pdf' },
      submittedOn: today,
    },
    {
      employeeId: 'e-leo',
      type: 'regular',
      status: 'approved',
      weeklySlots: [{ weekday: 2, period: 'day' }],
      startDate: `${year}-03-02`,
      submittedOn: `${year}-02-10`,
      decidedOn: `${year}-02-12`,
    },
    {
      employeeId: 'e-hugo',
      type: 'regular',
      status: 'approved',
      weeklySlots: [
        { weekday: 1, period: 'pm' },
        { weekday: 5, period: 'day' },
      ],
      startDate: `${year}-05-04`,
      submittedOn: `${year}-04-14`,
      decidedOn: `${year}-04-15`,
    },
    // Saisie par Camille pour Léo : validée tout de suite.
    {
      employeeId: 'e-leo',
      type: 'occasional',
      status: 'approved',
      reason: 'professional',
      days: days([addDays(nextMonday, 10)]),
      comment: 'Convenu en réunion d’équipe : intervention chez un client en télétravail.',
      enteredBy: 'e-camille',
      submittedOn: addDays(today, -3),
      decidedOn: addDays(today, -3),
    },
    // Télétravail mixte sur dérogation : un rythme fixe et un jour ponctuel.
    {
      employeeId: 'e-ines',
      type: 'mixed',
      status: 'approved',
      reason: 'professional',
      weeklySlots: [{ weekday: 3, period: 'am' }],
      startDate: `${year}-06-01`,
      days: days([addDays(nextMonday, 3)]),
      comment:
        'Dérogation accordée : le mercredi matin en continu, plus un jour de formation à distance.',
      submittedOn: `${year}-05-18`,
      decidedOn: `${year}-05-20`,
    },
  ]
}
