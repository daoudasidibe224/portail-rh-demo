import { onUnmounted, ref, watchEffect } from 'vue'

import { documentTitle } from '@/router'

export const pageTitle = ref<string | null>(null)

/** Remplace le titre de la route (onglet et fil d'Ariane). */
export function usePageTitle(title: () => string) {
  watchEffect(() => {
    pageTitle.value = title()
    document.title = documentTitle(pageTitle.value)
  })
  onUnmounted(() => {
    pageTitle.value = null
  })
}

// Le détail d'une demande d'équipe remonte vers « Mon équipe ».
export const parentOverride = ref<string | null>(null)

export function usePageParent(parent: () => string | null) {
  watchEffect(() => {
    parentOverride.value = parent()
  })
  onUnmounted(() => {
    parentOverride.value = null
  })
}
