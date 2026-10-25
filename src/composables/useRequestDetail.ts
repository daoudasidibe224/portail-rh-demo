import { computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'

import { usePageHeading } from '@/composables/usePageHeading'
import { usePageParent } from '@/composables/usePageTitle'
import { useToast } from '@/composables/useToast'
import { addBusinessDays } from '@/domain/businessDays'
import { RULES } from '@/domain/rules'
import { fullName } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

// Demande affichée, droits de lecture et actions de traitement de la page de détail.
export function useRequestDetail(getId: () => string) {
  const portal = usePortalStore()
  const route = useRoute()
  const { show } = useToast()
  const heading = usePageHeading()

  const request = computed(() => portal.requestById(getId()))
  const author = computed(() => portal.employeeById(request.value?.employeeId))
  const isMine = computed(() => request.value?.employeeId === portal.currentUser.id)
  const isTeam = computed(() => author.value?.managerId === portal.currentUser.id)
  const notFound = computed(() => !request.value || (!isMine.value && !isTeam.value))
  usePageParent(() => (isTeam.value && !isMine.value ? 'team' : null))
  const justSent = computed(
    () => route.query.envoyee === '1' && request.value?.status === 'pending',
  )

  /* Date limite annoncée pour la réponse, comptée en jours ouvrés depuis l'envoi. */
  const responseDeadline = computed(() =>
    request.value
      ? addBusinessDays(request.value.createdAt.slice(0, 10), RULES.responseBusinessDays)
      : '',
  )
  const managerName = computed(() => (portal.manager ? fullName(portal.manager) : null))
  const authorName = computed(() => (author.value ? fullName(author.value) : ''))

  /* Les boutons disparaissent une fois la demande traitée : le focus revient au titre.
     Le setTimeout laisse le dialogue rendre son propre focus d'abord. */
  async function run(action: () => unknown, message: string) {
    try {
      action()
      show(message)
      await nextTick()
      setTimeout(() => heading.value?.focus(), 0)
    } catch (error) {
      show('Action impossible', {
        tone: 'error',
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  const approve = () => run(() => portal.approve(getId()), `Demande de ${authorName.value} validée`)
  const reject = (comment: string) => run(() => portal.reject(getId(), comment), 'Demande refusée')

  return {
    heading,
    request,
    author,
    isMine,
    notFound,
    justSent,
    responseDeadline,
    managerName,
    approve,
    reject,
  }
}
