import { CONTACT } from './contact'
import type { Employee } from './types'

/** Minuscules, sans accent ni apostrophe : « Inès » et « ines » se valent. */
function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

type Searchable = Pick<Employee, 'firstName' | 'lastName' | 'team' | 'jobTitle'>

function compareByName(a: Searchable, b: Searchable): number {
  return (
    a.lastName.localeCompare(b.lastName, 'fr', { sensitivity: 'base' }) ||
    a.firstName.localeCompare(b.firstName, 'fr', { sensitivity: 'base' })
  )
}

/** Collaborateurs dont prénom, nom, équipe ou poste contiennent tous les mots de la recherche, triés par nom. */
export function searchDirectory<T extends Searchable>(employees: readonly T[], query: string): T[] {
  const words = normalizeText(query).split(' ').filter(Boolean)
  const matches = employees.filter((employee) => {
    const haystack = normalizeText(
      `${employee.firstName} ${employee.lastName} ${employee.team} ${employee.jobTitle}`,
    )
    return words.every((word) => haystack.includes(word))
  })
  return matches.sort(compareByName)
}

// Adresse fictive : prenom.nom@domaine.
export function directoryEmail(employee: Pick<Employee, 'firstName' | 'lastName'>): string {
  const part = (value: string) => normalizeText(value).replace(/[^a-z0-9-]/g, '')
  return `${part(employee.firstName)}.${part(employee.lastName)}@${CONTACT.emailDomain}`
}
