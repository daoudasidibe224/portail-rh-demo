import { defineStore } from 'pinia'
import { ref } from 'vue'

import { createJsonStore, STORAGE_PREFIX } from '@/services/storage'

interface SavedPreferences {
  noticeDismissed: boolean
}

function isSavedPreferences(value: unknown): value is SavedPreferences {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as SavedPreferences).noticeDismissed === 'boolean'
  )
}

const preferencesStorage = createJsonStore<SavedPreferences>(
  `${STORAGE_PREFIX}:preferences:v2`,
  isSavedPreferences,
)

// Si le navigateur refuse l'enregistrement, la valeur reste valable pour la session.
export const usePreferencesStore = defineStore('preferences', () => {
  const noticeDismissed = ref(preferencesStorage.load()?.noticeDismissed ?? false)

  function dismissNotice() {
    noticeDismissed.value = true
    preferencesStorage.save({ noticeDismissed: true })
  }

  return { noticeDismissed, dismissNotice }
})
