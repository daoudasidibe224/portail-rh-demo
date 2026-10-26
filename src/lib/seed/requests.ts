import { addDays } from '../dates'
import { addBusinessDays } from '../workdays'
import { days, type RequestSeed, type SeedCalendar } from './build'

const SIX_MONTHS_IN_DAYS = 182

function myRequestSeeds({ today, year, previousMonday, nextMonday }: SeedCalendar): RequestSeed[] {
  return [
    // Camille : régulier le mercredi, 3,5 j occasionnels validés, 1 j en attente, soit 3,5 j disponibles.
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

/** Demandes de l'équipe, à valider par Camille. */
function teamRequestSeeds({ today, nextMonday }: SeedCalendar): RequestSeed[] {
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
  ]
}

/**
 * L'ordre fixe les identifiants et les références (r-0001, TT-2026-00001…).
 * Les dates fixes suivent l'année de la démo, les autres sont relatives à aujourd'hui.
 */
export function requestSeeds(calendar: SeedCalendar): RequestSeed[] {
  return [...myRequestSeeds(calendar), ...teamRequestSeeds(calendar)]
}
