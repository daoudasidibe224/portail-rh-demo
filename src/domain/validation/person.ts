import type { RequestDraft } from '../types'
import type { Add, ValidationContext } from './types'

/** Pour qui est la demande : un membre choisi, ou une personne saisie à la main. */
export function validatePerson(draft: RequestDraft, ctx: ValidationContext, add: Add) {
  const who = draft.onBehalf
  if (who.kind === 'member' && !who.employeeId) {
    add('person', 'Choisissez le membre de votre équipe.')
  }
  if (who.kind !== 'other') return
  if (!/^00\d{6}$/.test(who.matricule)) {
    add('person', 'Le matricule compte 8 chiffres et commence par 00.')
  } else if (ctx.knownMatricules.has(who.matricule)) {
    add(
      'person',
      'Ce matricule existe déjà dans le portail : vérifiez-le ou choisissez la personne dans votre équipe.',
    )
  }
  if (!who.firstName.trim() || !who.lastName.trim()) {
    add('person', 'Indiquez le prénom et le nom de la personne.')
  }
}
