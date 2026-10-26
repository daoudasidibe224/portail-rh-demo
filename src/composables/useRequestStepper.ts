import { computed, nextTick, reactive, ref } from 'vue'

import { errorsForStep, firstStepWithErrors, LAST_STEP, REQUEST_STEPS } from '@/lib/steps'
import type { ValidationError } from '@/lib/validation'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

/**
 * Parcours en étapes. Chaque étape est validée en la quittant ; les erreurs restent
 * silencieuses jusqu'à la première tentative sur cette étape, puis s'affichent en direct.
 */
export function useRequestStepper() {
  const portal = usePortalStore()
  const drafts = useDraftStore()

  const step = ref(0)
  const reached = ref(0)
  const attempts = reactive<number[]>(REQUEST_STEPS.map(() => 0))
  // Éléments qui reçoivent le focus à l'arrivée sur une étape (liés dans le gabarit).
  const stepCard = ref<{ focus: () => void } | null>(null)
  const summary = ref<{ focus: () => void } | null>(null)

  const isLast = computed(() => step.value === LAST_STEP)
  const allErrors = computed(() => portal.validate(drafts.draft))
  const visibleErrors = computed(() =>
    attempts[step.value] ? errorsForStep(allErrors.value, step.value) : [],
  )
  const currentAttempt = computed(() => attempts[step.value] ?? 0)

  const flag = (index: number) => {
    attempts[index] = (attempts[index] ?? 0) + 1
  }

  async function goTo(index: number, focus: 'title' | 'summary' = 'title') {
    // Les erreurs d'une étape ne s'affichent qu'après une tentative faite pendant cette visite.
    if (focus === 'title') attempts[index] = 0
    step.value = index
    reached.value = Math.max(reached.value, index)
    await nextTick()
    if (focus === 'summary') summary.value?.focus()
    else stepCard.value?.focus()
  }

  /** Depuis le fil d'étapes : revenir en arrière est libre, avancer demande une étape valide. */
  function jump(index: number) {
    if (index > step.value && errorsForStep(allErrors.value, step.value).length) {
      flag(step.value)
      return
    }
    void goTo(index)
  }

  function back() {
    void goTo(step.value - 1)
  }

  /** Passe à l'étape suivante ; sur la dernière, appelle `onComplete` si tout est valide. */
  function advance(onComplete: () => void) {
    if (!isLast.value) {
      if (errorsForStep(allErrors.value, step.value).length) flag(step.value)
      else void goTo(step.value + 1)
      return
    }
    const first = firstStepWithErrors(allErrors.value)
    if (first === -1) {
      onComplete()
      return
    }
    flag(first)
    // Hors de l'étape courante, on y retourne : le résumé d'erreurs prend le focus.
    if (first !== step.value) void goTo(first, 'summary')
  }

  /** L'état a changé depuis la validation (autre onglet, date prise) : retour à l'erreur. */
  function showErrors(errors: readonly ValidationError[]) {
    const first = firstStepWithErrors(errors)
    if (first === -1) return
    flag(first)
    void goTo(first, 'summary')
  }

  function restart() {
    step.value = 0
    reached.value = 0
    attempts.fill(0)
  }

  return {
    step,
    reached,
    isLast,
    stepCard,
    summary,
    visibleErrors,
    currentAttempt,
    jump,
    back,
    advance,
    showErrors,
    restart,
  }
}
