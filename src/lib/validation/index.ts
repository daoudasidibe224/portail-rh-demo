import type { RequestDraft } from '../types'
import { validateCommitments, validateDetails } from './details'
import { validateDays } from './days'
import { validatePerson } from './person'
import { validateRegular } from './regular'
import type { Add, FieldKey, ValidationContext, ValidationError } from './types'

export type { FieldKey, ValidationContext, ValidationError } from './types'

/** Valide une saisie ; les messages disent quoi corriger. */
export function validateDraft(draft: RequestDraft, ctx: ValidationContext): ValidationError[] {
  const errors: ValidationError[] = []
  const add: Add = (field, message) => errors.push({ field, message })

  validatePerson(draft, ctx, add)

  if (draft.type === 'absence' || draft.type === 'unused') {
    add(
      'type',
      draft.type === 'absence'
        ? 'Une absence hors télétravail se déclare dans « Absences diverses » : choisissez un type de télétravail pour continuer.'
        : 'Ce type ne doit pas être utilisé : choisissez-en un autre.',
    )
    return errors
  }

  if (draft.type === 'regular' || draft.type === 'mixed') validateRegular(draft, ctx, add)
  if (draft.type !== 'regular') validateDays(draft, ctx, add)
  validateDetails(draft, add)
  validateCommitments(draft, ctx, add)

  return errors
}

export function errorsFor(errors: readonly ValidationError[], field: FieldKey): string[] {
  return errors.filter((e) => e.field === field).map((e) => e.message)
}
