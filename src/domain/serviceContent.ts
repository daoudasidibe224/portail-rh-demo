import { addDays, addMonths, formatFull, yearOf, type ISODate } from './dates'

// Contenu fictif des services hors télétravail.
interface ServiceTile {
  label: string
  value: string
  hint?: string
}

interface ServiceRow {
  title: string
  meta: string
  status?: string
}

interface ServiceContent {
  tiles: ServiceTile[]
  listTitle: string
  rows: ServiceRow[]
  // Ce que le vrai service permettrait en plus.
  later: string
}

const monthName = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const euro = (n: number) => `${n.toFixed(2).replace('.', ',')} €`

function firstOfMonth(today: ISODate): ISODate {
  return `${today.slice(0, 8)}01`
}

const MAKERS: Record<string, (today: ISODate) => ServiceContent> = {
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
  'formulaires-cerfa': () => ({
    tiles: [],
    listTitle: 'Formulaires disponibles',
    rows: [
      { title: 'Attestation employeur', meta: 'Formulaire administratif · PDF' },
      { title: 'Demande de congé parental', meta: 'Formulaire administratif · PDF' },
      { title: 'Déclaration de changement de situation', meta: 'Formulaire administratif · PDF' },
      { title: 'Demande d’avance sur salaire', meta: 'Formulaire administratif · PDF' },
    ],
    later: 'télécharger chaque formulaire, le remplir en ligne et l’envoyer au service RH',
  }),
  mutuelle: () => ({
    tiles: [
      { label: 'Contrat', value: 'Santé Famille', hint: 'Contrat fictif' },
      { label: 'Bénéficiaires', value: '2' },
      { label: 'Cotisation salariale', value: euro(38.5), hint: 'par mois' },
    ],
    listTitle: 'Mes documents',
    rows: [
      { title: 'Carte de tiers payant', meta: 'PDF · valable jusqu’au 31 décembre' },
      { title: 'Attestation de mutuelle', meta: 'PDF · mise à jour à chaque changement' },
      { title: 'Tableau des garanties', meta: 'PDF · 4 pages' },
    ],
    later:
      'consulter votre contrat, déclarer un changement de situation et télécharger vos attestations',
  }),
  'charte-informatique': () => ({
    tiles: [
      { label: 'Version en vigueur', value: 'v3' },
      {
        label: 'Votre acceptation',
        value: 'À jour',
        hint: 'Acceptée à l’arrivée dans l’entreprise',
      },
    ],
    listTitle: 'Ce que dit la charte',
    rows: [
      { title: 'Mots de passe', meta: 'Un mot de passe unique par service, jamais partagé.' },
      { title: 'Matériel', meta: 'Signaler sans délai toute perte ou tout vol.' },
      { title: 'Messagerie', meta: 'Ne pas ouvrir de pièce jointe d’un expéditeur inconnu.' },
    ],
    later: 'lire la charte complète et accepter ses mises à jour',
  }),
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

export function serviceContent(slug: string, today: ISODate): ServiceContent | undefined {
  return MAKERS[slug]?.(today)
}
