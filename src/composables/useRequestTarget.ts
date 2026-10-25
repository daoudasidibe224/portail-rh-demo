import { computed } from 'vue'

import { fullName } from '@/domain/types'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

/** La personne concernée par la demande en cours : le demandeur, un membre de l'équipe, ou une saisie libre. */
export function useRequestTarget() {
  const portal = usePortalStore()
  const drafts = useDraftStore()

  // `undefined` tant qu'une personne saisie à la main n'est pas enregistrée.
  const target = computed(() => portal.targetOf(drafts.draft))
  const forOther = computed(() => drafts.draft.onBehalf.kind !== 'self')

  const person = computed(() => {
    const employee = target.value
    if (employee) {
      return {
        name: fullName(employee),
        matricule: employee.matricule,
        team: employee.team,
        costCenter: employee.costCenter,
      }
    }
    const who = drafts.draft.onBehalf
    const name = `${who.firstName.trim()} ${who.lastName.trim().toUpperCase()}`.trim()
    return {
      name: name || 'Personne à ajouter',
      matricule: who.matricule || 'à renseigner',
      team: portal.currentUser.team,
      costCenter: portal.currentUser.costCenter,
    }
  })

  const defaultCostCenter = computed(
    () => target.value?.costCenter ?? portal.currentUser.costCenter,
  )

  return { target, forOther, person, defaultCostCenter }
}
