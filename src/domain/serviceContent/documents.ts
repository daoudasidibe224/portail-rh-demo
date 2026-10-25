import type { ISODate } from '../dates'
import { euro, type ServiceContent } from './helpers'

// Documents : formulaires, mutuelle, charte informatique.
export const DOCUMENTS_SERVICES: Record<string, (today: ISODate) => ServiceContent> = {
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
}
