import { defineStore } from 'pinia'
import { ref } from 'vue'

import { createJsonStore, STORAGE_PREFIX } from '@/services/storage'

interface SavedPreferences {
  newsletter: boolean
}

function isSavedPreferences(value: unknown): value is SavedPreferences {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as SavedPreferences).newsletter === 'boolean'
  )
}

const preferencesStorage = createJsonStore<SavedPreferences>(
  `${STORAGE_PREFIX}:preferences:v1`,
  isSavedPreferences,
)

// Si le navigateur refuse l'enregistrement, la valeur reste valable pour la session.
export const usePreferencesStore = defineStore('preferences', () => {
  const newsletter = ref(preferencesStorage.load()?.newsletter ?? false)
  const persistenceError = ref(false)

  function setNewsletter(value: boolean) {
    newsletter.value = value
    persistenceError.value = !preferencesStorage.save({ newsletter: value })
  }

  return { newsletter, persistenceError, setNewsletter }
})
