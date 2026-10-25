import { addDays, type ISODate } from '../dates'
import { formatFull } from '../dateFormat'
import { type ServiceContent } from './helpers'

// Carrière : entretien annuel.
export const CAREER_SERVICES: Record<string, (today: ISODate) => ServiceContent> = {
  'entretien-annuel': (today) => ({
    tiles: [
      {
        label: 'Prochain entretien',
        value: formatFull(addDays(today, 24)),
        hint: 'Avec Sophie Laurent',
      },
      { label: 'Objectifs de l’année', value: '4', hint: '2 atteints' },
    ],
    listTitle: 'Mon suivi',
    rows: [
      {
        title: 'Préparer mon auto-évaluation',
        meta: 'À remplir avant l’entretien',
        status: 'À faire',
      },
      {
        title: 'Objectif : réduire le temps de réponse client',
        meta: 'Fin de l’année',
        status: 'En cours',
      },
      {
        title: 'Objectif : former deux nouveaux conseillers',
        meta: 'Atteint en septembre',
        status: 'Atteint',
      },
    ],
    later: 'préparer l’entretien, suivre vos objectifs et retrouver les comptes rendus passés',
  }),
}
