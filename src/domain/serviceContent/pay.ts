import { addDays, addMonths, type ISODate } from '../dates'
import { formatFull } from '../dateFormat'
import { euro, firstOfMonth, monthName, type ServiceContent } from './helpers'

// Paie : bulletins, notes de frais, tickets restaurant.
export const PAY_SERVICES: Record<string, (today: ISODate) => ServiceContent> = {
  'bulletins-de-paie': (today) => {
    const months = [1, 2, 3, 4, 5, 6].map((i) => addMonths(firstOfMonth(today), -i))
    return {
      tiles: [
        { label: 'Dernier bulletin', value: monthName.format(new Date(`${months[0]}T00:00:00Z`)) },
        { label: 'Net à payer', value: euro(2418.6), hint: 'Montant fictif' },
        { label: 'Prochain bulletin', value: formatFull(addMonths(firstOfMonth(today), 1)) },
      ],
      listTitle: 'Mes derniers bulletins',
      rows: months.map((m) => ({
        title: `Bulletin de ${monthName.format(new Date(`${m}T00:00:00Z`))}`,
        meta: 'PDF · 1 page · mis à disposition fin de mois',
      })),
      later: 'télécharger chaque bulletin au format PDF et retrouver ceux des années précédentes',
    }
  },
  'notes-de-frais': (today) => ({
    tiles: [
      { label: 'En attente de remboursement', value: euro(86.4) },
      { label: 'Remboursé ce mois-ci', value: euro(142.1) },
      { label: 'Notes en brouillon', value: '1' },
    ],
    listTitle: 'Mes dernières notes de frais',
    rows: [
      {
        title: 'Déplacement client à Lyon',
        meta: `${formatFull(addDays(today, -4))} · ${euro(64.2)}`,
        status: 'En cours de validation',
      },
      {
        title: 'Repas d’équipe',
        meta: `${formatFull(addDays(today, -9))} · ${euro(22.2)}`,
        status: 'En cours de validation',
      },
      {
        title: 'Billet de train Paris - Lyon',
        meta: `${formatFull(addDays(today, -19))} · ${euro(98)}`,
        status: 'Remboursée',
      },
      {
        title: 'Taxi aéroport',
        meta: `${formatFull(addDays(today, -32))} · ${euro(44.1)}`,
        status: 'Remboursée',
      },
      {
        title: 'Fournitures de bureau',
        meta: `${formatFull(addDays(today, -47))} · ${euro(31.5)}`,
        status: 'Refusée : justificatif manquant',
      },
    ],
    later: 'saisir une dépense avec son justificatif, suivre sa validation et son remboursement',
  }),
  'tickets-restaurant': (today) => ({
    tiles: [
      { label: 'Solde', value: '42 tickets' },
      { label: 'Valeur d’un ticket', value: euro(9) },
      { label: 'Prochaine remise', value: formatFull(addMonths(firstOfMonth(today), 1)) },
    ],
    listTitle: 'Mes dernières remises',
    rows: [1, 2, 3, 4].map((i) => ({
      title: `Remise de ${monthName.format(new Date(`${addMonths(firstOfMonth(today), -i)}T00:00:00Z`))}`,
      meta: '19 tickets · 171,00 €',
    })),
    later: 'consulter le détail de chaque remise et commander des tickets supplémentaires',
  }),
}
