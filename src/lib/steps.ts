import type { FieldKey, ValidationError } from './validation'

interface RequestStep {
  id: 'when' | 'details' | 'review'
  title: string
  // Libellé court du fil d'étapes.
  short: string
  hint: string
  // Champs validés quand on quitte l'étape.
  fields: readonly FieldKey[]
}

export const REQUEST_STEPS: readonly RequestStep[] = [
  {
    id: 'when',
    title: 'Type et dates',
    short: 'Dates',
    hint: 'Quand voulez-vous télétravailler ?',
    fields: ['person', 'type', 'days', 'weeklySlots', 'startDate', 'endDate'],
  },
  {
    id: 'details',
    title: 'Précisions',
    short: 'Précisions',
    hint: 'Motif, centre de coût, message et justificatif.',
    fields: ['reason', 'comment', 'attachment'],
  },
  {
    id: 'review',
    title: 'Vérification et envoi',
    short: 'Envoi',
    hint: 'Relisez votre demande, puis confirmez vos engagements.',
    fields: ['charter', 'connection'],
  },
]

export const LAST_STEP = REQUEST_STEPS.length - 1

export function errorsForStep(errors: readonly ValidationError[], step: number): ValidationError[] {
  const fields = REQUEST_STEPS[step]?.fields ?? []
  return errors.filter((error) => fields.includes(error.field))
}

/** Première étape qui contient une erreur, ou -1. */
export function firstStepWithErrors(errors: readonly ValidationError[]): number {
  return REQUEST_STEPS.findIndex((_, index) => errorsForStep(errors, index).length > 0)
}
