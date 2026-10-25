import { computed } from 'vue'

import { describeQuantity, formatDays, formatHours } from '@/domain/format'
import { countDays, countWeeklyDays } from '@/domain/schedule'
import { useRequestTarget } from '@/composables/useRequestTarget'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

/** Chiffres de la demande en cours : durée, solde restant, textes du récapitulatif. */
export function useRequestSummary() {
  const portal = usePortalStore()
  const drafts = useDraftStore()

  const { target } = useRequestTarget()
  const requestedDays = computed(() => countDays(drafts.draft.days))
  const balanceAfter = computed(
    () => portal.balanceFor(target.value).available - requestedDays.value,
  )
  // Régulier : rythme hebdomadaire. Mixte : rythme et jours. Les autres : jours seulement.
  const usesBalance = computed(
    () => drafts.draft.type === 'occasional' || drafts.draft.type === 'mixed',
  )
  const requestedHours = computed(() => {
    const type = drafts.draft.type
    const weekly = `${formatHours(countWeeklyDays(drafts.draft.weeklySlots))} par semaine`
    const days = requestedDays.value ? formatHours(requestedDays.value) : ''
    if (type === 'regular') return weekly
    if (type === 'mixed') return days ? `${weekly}, plus ${days}` : weekly
    return days
  })
  const overBalance = computed(() => usesBalance.value && balanceAfter.value < 0)

  const barTitle = computed(() => describeQuantity(drafts.draft))
  const barDetail = computed(() => {
    if (usesBalance.value) {
      return balanceAfter.value < 0
        ? `Dépassement de ${formatDays(-balanceAfter.value)}`
        : `Solde : ${formatDays(balanceAfter.value)}`
    }
    return drafts.draft.type === 'exceptional' ? 'Hors solde' : ''
  })

  return {
    requestedDays,
    balanceAfter,
    requestedHours,
    usesBalance,
    overBalance,
    barTitle,
    barDetail,
  }
}
