import { addDays, yearOf, type ISODate } from '../dates'
import { formatFull } from '../dateFormat'
import { type ServiceContent } from './helpers'

// Absences : congés payés, RTT, absences diverses.
export const ABSENCES_SERVICES: Record<string, (today: ISODate) => ServiceContent> = {
  'conges-payes': (today) => ({
    tiles: [
      { label: 'Solde de l’année', value: '18,5 jours' },
      { label: 'Solde de l’an dernier', value: '2 jours', hint: 'À poser avant le 31 mai' },
      { label: 'Jours déjà posés', value: '6,5 jours' },
    ],
    listTitle: 'Mes congés',
    rows: [
      {
        title: 'Congés d’été',
        meta: `${formatFull(addDays(today, -120))} au ${formatFull(addDays(today, -108))} · 10 jours`,
        status: 'Pris',
      },
      {
        title: 'Pont de l’Ascension',
        meta: `${formatFull(addDays(today, -160))} · 1 jour`,
        status: 'Pris',
      },
      {
        title: 'Vacances de fin d’année',
        meta: `${formatFull(addDays(today, 60))} au ${formatFull(addDays(today, 66))} · 5 jours`,
        status: 'Validé',
      },
    ],
    later: 'poser un congé, voir le planning de l’équipe et suivre la validation',
  }),
  rtt: (today) => ({
    tiles: [
      { label: 'Solde', value: '6 jours' },
      { label: 'Acquis ce mois-ci', value: '0,5 jour' },
      { label: 'À poser avant', value: formatFull(`${yearOf(today)}-12-31`) },
    ],
    listTitle: 'Mes jours de RTT',
    rows: [
      {
        title: 'Vendredi après-midi',
        meta: `${formatFull(addDays(today, -21))} · 0,5 jour`,
        status: 'Pris',
      },
      {
        title: 'Journée de pont',
        meta: `${formatFull(addDays(today, -75))} · 1 jour`,
        status: 'Pris',
      },
      { title: 'Lundi', meta: `${formatFull(addDays(today, 28))} · 1 jour`, status: 'Validé' },
    ],
    later: 'poser des RTT et suivre l’acquisition mois par mois',
  }),
  'absences-diverses': (today) => ({
    tiles: [
      { label: 'Absences cette année', value: '3' },
      { label: 'Dernière absence', value: formatFull(addDays(today, -52)) },
    ],
    listTitle: 'Mes absences',
    rows: [
      {
        title: 'Événement familial',
        meta: `${formatFull(addDays(today, -52))} · 2 jours`,
        status: 'Accordée',
      },
      {
        title: 'Rendez-vous médical',
        meta: `${formatFull(addDays(today, -88))} · 0,5 jour`,
        status: 'Accordée',
      },
      {
        title: 'Congé sans solde',
        meta: `${formatFull(addDays(today, -140))} · 1 jour`,
        status: 'Refusée : période de clôture',
      },
    ],
    later:
      'déclarer une absence (événement familial, maladie, congé sans solde) avec ses justificatifs',
  }),
}
