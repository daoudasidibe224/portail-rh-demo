import { defineStore } from 'pinia'
import { ref } from 'vue'

import { createJsonStore, STORAGE_PREFIX } from '@/services/storage'

interface SavedPreferences {
  newsletter: boolean
  // Absent des préférences enregistrées avant l'ajout du bandeau.
  noticeDismissed?: boolean
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
  const saved = preferencesStorage.load()
  const newsletter = ref(saved?.newsletter ?? false)
  const noticeDismissed = ref(saved?.noticeDismissed ?? false)
  const persistenceError = ref(false)

  function persist() {
    persistenceError.value = !preferencesStorage.save({
      newsletter: newsletter.value,
      noticeDismissed: noticeDismissed.value,
    })
  }

  function setNewsletter(value: boolean) {
    newsletter.value = value
    persist()
  }

  function dismissNotice() {
    noticeDismissed.value = true
    persist()
  }

  return { newsletter, noticeDismissed, persistenceError, setNewsletter, dismissNotice }
})
