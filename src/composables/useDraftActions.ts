import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from '@/composables/useToast'
import { useDraftStore } from '@/stores/draft'

/** Annuler la demande, tout effacer et imprimer : les actions sur le brouillon en cours. */
export function useDraftActions(restart: () => void, focusHeading: () => void) {
  const drafts = useDraftStore()
  const router = useRouter()
  const { show } = useToast()

  const cancelOpen = ref(false)
  const resetOpen = ref(false)

  function leave() {
    if (drafts.dirty) cancelOpen.value = true
    else router.push('/teletravail')
  }

  function discard() {
    drafts.reset()
    router.push('/teletravail')
  }

  /* Le bouton disparaît une fois la saisie effacée : le focus revient au titre,
     après que le dialogue a rendu le sien. */
  async function startOver() {
    drafts.reset()
    restart()
    show('Saisie effacée', { description: 'Le formulaire est vide, vous pouvez recommencer.' })
    await nextTick()
    setTimeout(focusHeading, 0)
  }

  const print = () => window.print()

  return { cancelOpen, resetOpen, leave, discard, startOver, print }
}
