import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useRequestTarget } from '@/composables/useRequestTarget'
import { isISODate } from '@/lib/dates'
import { SUBMITTABLE_TYPES } from '@/lib/rules'
import { emptyOnBehalf, type OnBehalf, type RequestType } from '@/lib/types'
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
 * Préremplit le formulaire : centre de coût de la personne concernée et raccourcis
 * (?type=&date=&pour=).
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

  onMounted(() => {
    const { type, date, pour } = route.query
    if (typeof type === 'string' && SUBMITTABLE_TYPES.includes(type as RequestType)) {
      drafts.reset({
        type: type as RequestType,
        days: typeof date === 'string' && isISODate(date) ? [{ date, period: 'day' }] : [],
      })
    }
    const onBehalf = onBehalfFromQuery(pour, portal.teamMembers)
    if (onBehalf) drafts.draft.onBehalf = onBehalf
  })
}
