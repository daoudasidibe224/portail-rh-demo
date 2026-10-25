import type { HrService, HrServiceGroup } from './types'

export const HR_SERVICE_GROUPS: Record<HrServiceGroup, { label: string }> = {
  paie: { label: 'Ma paie' },
  absences: { label: 'Mes absences' },
  documents: { label: 'Mes documents' },
  carriere: { label: 'Ma carrière' },
}

// Seul le télétravail a une vraie page ; les autres ouvrent `/services/:slug` (voir `serviceContent.ts`).
export const HR_SERVICES: HrService[] = [
  {
    slug: 'bulletins-de-paie',
    label: 'Mes bulletins de paie',
    description: 'Télécharger vos bulletins au format PDF',
    group: 'paie',
  },
  {
    slug: 'notes-de-frais',
    label: 'Notes de frais',
    description: 'Saisir vos dépenses professionnelles et suivre leur remboursement',
    group: 'paie',
  },
  {
    slug: 'tickets-restaurant',
    label: 'Tickets restaurant',
    description: 'Consulter votre solde et vos commandes de tickets restaurant',
    group: 'paie',
  },
  {
    slug: 'teletravail',
    label: 'Télétravail',
    description: 'Demander du télétravail et suivre vos demandes',
    group: 'absences',
    to: '/teletravail',
  },
  {
    slug: 'conges-payes',
    label: 'Congés payés',
    description: 'Poser vos congés et consulter votre solde',
    group: 'absences',
  },
  {
    slug: 'rtt',
    label: 'RTT',
    description: 'Poser vos jours de RTT et consulter votre solde',
    group: 'absences',
  },
  {
    slug: 'absences-diverses',
    label: 'Absences diverses',
    description: 'Déclarer une absence : événement familial, maladie, congé sans solde',
    group: 'absences',
  },
  {
    slug: 'formulaires-cerfa',
    label: 'Formulaires CERFA',
    description: 'Télécharger les formulaires administratifs courants',
    group: 'documents',
  },
  {
    slug: 'mutuelle',
    label: 'Mutuelle',
    description: 'Consulter votre contrat et déclarer un changement de situation',
    group: 'documents',
  },
  {
    slug: 'charte-informatique',
    label: 'Charte informatique',
    description: 'Lire et accepter la charte informatique',
    group: 'documents',
  },
  {
    slug: 'entretien-annuel',
    label: 'Entretien annuel',
    description: 'Préparer votre entretien annuel et consulter vos objectifs',
    group: 'carriere',
  },
]

export function serviceBySlug(slug: string): HrService | undefined {
  return HR_SERVICES.find((service) => service.slug === slug)
}

export function servicePath(service: HrService): string {
  return service.to ?? `/services/${service.slug}`
}

export function servicesByGroup(): {
  group: HrServiceGroup
  label: string
  services: HrService[]
}[] {
  return (Object.keys(HR_SERVICE_GROUPS) as HrServiceGroup[]).map((group) => ({
    group,
    label: HR_SERVICE_GROUPS[group].label,
    services: HR_SERVICES.filter((service) => service.group === group),
  }))
}
