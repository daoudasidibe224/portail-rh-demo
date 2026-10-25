import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { errorsFor, type FieldKey, type ValidationError } from '@/domain/validation'

// Identifiants des champs, pour les liens du résumé d'erreurs.
export const ANCHORS: Record<FieldKey, string> = {
  person: 'field-person',
  type: 'field-type',
  days: 'field-days',
  weeklySlots: 'field-weekly',
  startDate: 'field-start',
  endDate: 'field-end',
  reason: 'field-reason',
  comment: 'field-comment',
  attachment: 'field-attachment',
  charter: 'field-charter',
  connection: 'field-connection',
}

/** Messages, état invalide et `aria-describedby` d'un champ, depuis la liste d'erreurs visibles. */
export function useFieldState(errors: MaybeRefOrGetter<readonly ValidationError[]>) {
  const visible = computed(() => toValue(errors))
  const fieldErrors = (field: FieldKey) => errorsFor(visible.value, field)
  const invalid = (field: FieldKey) => fieldErrors(field).length > 0
  const describedBy = (field: FieldKey, hint?: string) =>
    [hint, invalid(field) ? `${field}-error` : null].filter(Boolean).join(' ') || undefined
  return { fieldErrors, invalid, describedBy }
}
