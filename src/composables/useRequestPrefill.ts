import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useRequestTarget } from '@/composables/useRequestTarget'
import { isISODate } from '@/domain/dates'
import { SUBMITTABLE_TYPES } from '@/domain/rules'
import { emptyOnBehalf, type OnBehalf, type RequestType } from '@/domain/types'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

/** ?pour=membre, ?pour=autre ou ?pour=<id d'un membre> : réservé aux managers. */
function onBehalfFromQuery(
  pour: unknown,
  teamMembers: readonly { id: string }[],
): OnBehalf | undefined {
  if (typeof pour !== 'string' || !teamMembers.length) return undefined
  if (pour === 'autre') return emptyOnBehalf('other')
  if (pour === 'membre') return emptyOnBehalf('member')
  return teamMembers.some((member) => member.id === pour)
    ? { ...emptyOnBehalf('member'), employeeId: pour }
    : undefined
}

/**
 * Préremplit le formulaire : centre de coût de la personne concernée, raccourci
 * (?type=&date=&pour=), duplication (?depuis=id), puis choix de la dernière demande.
 */
export function useRequestPrefill() {
  const portal = usePortalStore()
  const drafts = useDraftStore()
  const route = useRoute()
  const { defaultCostCenter } = useRequestTarget()

  /* Le centre de coût est toujours renseigné : celui de la personne concernée. */
  watch(
    () => drafts.draft.costCenter,
    (value) => {
      if (!value) drafts.draft.costCenter = defaultCostCenter.value
    },
    { immediate: true },
  )
  watch(
    () => [drafts.draft.onBehalf.kind, drafts.draft.onBehalf.employeeId],
    () => {
      drafts.draft.costCenter = defaultCostCenter.value
    },
  )

  /* Reprend le centre de coût et le choix de recontact de la dernière demande,
     sur une saisie encore vide. La connexion et la charte restent à confirmer. */
  function prefillFromLastRequest() {
    const last = portal.myRequests[0]
    if (!last || drafts.dirty) return
    if (last.costCenter && last.costCenter !== portal.currentUser.costCenter) {
      drafts.draft.costCenter = last.costCenter
    }
    drafts.draft.recontactAllowed ||= last.recontactAllowed ?? false
  }

  onMounted(() => {
    const { depuis, type, date, pour } = route.query
    const source = typeof depuis === 'string' ? portal.requestById(depuis) : undefined
    if (source) {
      drafts.reset({
        type: source.type,
        weeklySlots: source.weeklySlots.map((s) => ({ ...s })),
        reason: source.reason,
        costCenter: source.costCenter ?? '',
        recontactAllowed: source.recontactAllowed ?? false,
        comment: source.comment,
      })
    } else if (typeof type === 'string' && SUBMITTABLE_TYPES.includes(type as RequestType)) {
      drafts.reset({
        type: type as RequestType,
        days: typeof date === 'string' && isISODate(date) ? [{ date, period: 'day' }] : [],
      })
    }
    const onBehalf = onBehalfFromQuery(pour, portal.teamMembers)
    if (onBehalf) drafts.draft.onBehalf = onBehalf
    prefillFromLastRequest()
  })
}
