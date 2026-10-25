import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useRequestTarget } from '@/composables/useRequestTarget'
import { useToast } from '@/composables/useToast'
import { describeQuantity, describeSchedule } from '@/domain/format'
import { REQUEST_TYPES } from '@/domain/rules'
import { fullName } from '@/domain/types'
import type { ValidationError } from '@/domain/validation'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore, ValidationFailedError } from '@/stores/portal'
import { usePreferencesStore } from '@/stores/preferences'

/** Confirmation et envoi de la demande. `onInvalid` reçoit les erreurs si l'état a changé entre-temps. */
export function useRequestSubmission(onInvalid: (errors: readonly ValidationError[]) => void) {
  const portal = usePortalStore()
  const drafts = useDraftStore()
  const preferences = usePreferencesStore()
  const router = useRouter()
  const { show } = useToast()
  const { forOther, person } = useRequestTarget()

  const sendOpen = ref(false)
  // Appliquée à l'envoi seulement : abandonner la demande ne change pas l'abonnement.
  const newsletter = ref(preferences.newsletter)

  const managerName = () => (portal.manager ? fullName(portal.manager) : 'Votre manager')

  const sendSummary = computed(() => {
    const draft = drafts.draft
    const recipient = forOther.value
      ? `Pour ${person.value.name} : la demande est validée tout de suite.`
      : `${managerName()} recevra la demande.`
    return `${REQUEST_TYPES[draft.type].label} : ${describeSchedule(draft)} (${describeQuantity(draft)}). ${recipient}`
  })

  function send() {
    const other = forOther.value
    const personName = person.value.name
    let request
    try {
      request = portal.submit(drafts.draft)
    } catch (error) {
      if (!(error instanceof ValidationFailedError)) throw error
      onInvalid(error.errors)
      return
    }
    if (newsletter.value !== preferences.newsletter) preferences.setNewsletter(newsletter.value)
    drafts.reset()
    show(other ? 'Demande enregistrée' : 'Demande envoyée', {
      description: other
        ? `${personName} : demande validée.`
        : `${managerName()} a reçu la demande.`,
    })
    router.push({ name: 'request', params: { id: request.id }, query: { envoyee: '1' } })
  }

  return { sendOpen, newsletter, sendSummary, send }
}
