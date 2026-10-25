import { computed, nextTick, ref } from 'vue'

import { useTeamAuthors } from '@/composables/useTeamAuthors'
import { useToast } from '@/composables/useToast'
import { plural } from '@/domain/format'
import type { TeleworkRequest } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

// Valider ou refuser retire la demande de la liste, donc le bouton qui avait le focus :
// `focusPending` renvoie le focus vers l'onglet « À valider ».
export function useTeamDecisions(focusTab: () => void) {
  const portal = usePortalStore()
  const { show } = useToast()
  const { authorName } = useTeamAuthors()

  async function focusPending(afterDialog = false) {
    await nextTick()
    if (afterDialog) {
      // Le dialogue rend d'abord le focus à son déclencheur, qui n'existe plus.
      setTimeout(focusTab, 0)
    } else {
      focusTab()
    }
  }

  function approve(request: TeleworkRequest) {
    portal.approve(request.id)
    show(`Demande de ${authorName(request)} validée`)
    void focusPending()
  }

  function approveMany(requests: readonly TeleworkRequest[]) {
    for (const request of requests) portal.approve(request.id)
    show(
      `${requests.length} ${plural(requests.length, 'demande')} ${plural(requests.length, 'validée')}`,
    )
    void focusPending()
  }

  const rejecting = ref<TeleworkRequest | null>(null)
  const rejectOpen = computed({
    get: () => rejecting.value !== null,
    set: (open) => {
      if (!open) rejecting.value = null
    },
  })
  function reject(comment: string) {
    if (!rejecting.value) return
    const request = rejecting.value
    portal.reject(request.id, comment)
    show(`Demande de ${authorName(request)} refusée`, { tone: 'info' })
    void focusPending(true)
  }

  return { approve, approveMany, rejecting, rejectOpen, reject }
}
