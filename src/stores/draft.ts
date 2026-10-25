import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { emptyDraft, type RequestDraft, type RequestType } from '@/domain/types'
import { createJsonStore, STORAGE_PREFIX } from '@/services/storage'

interface SavedDraft {
  draft: RequestDraft
  savedAt: string
}

function isSavedDraft(value: unknown): value is SavedDraft {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<SavedDraft>
  return typeof v.savedAt === 'string' && !!v.draft && Array.isArray(v.draft.days)
}

const draftStorage = createJsonStore<SavedDraft>(`${STORAGE_PREFIX}:draft:v1`, isSavedDraft)

// Brouillon de la demande en cours, enregistré à chaque modification.
export const useDraftStore = defineStore('draft', () => {
  const saved = draftStorage.load()
  const draft = ref<RequestDraft>(saved ? { ...emptyDraft(), ...saved.draft } : emptyDraft())
  const savedAt = ref<string | null>(saved?.savedAt ?? null)
  const restored = ref(saved !== null && isDirty(saved.draft))

  watch(
    draft,
    (value) => {
      if (!isDirty(value)) {
        draftStorage.clear()
        savedAt.value = null
        restored.value = false
        return
      }
      savedAt.value = new Date().toISOString()
      draftStorage.save({ draft: value, savedAt: savedAt.value })
    },
    { deep: true },
  )

  const dirty = computed(() => isDirty(draft.value))

  function reset(prefill: Partial<RequestDraft> = {}) {
    draft.value = { ...emptyDraft(), ...prefill }
    restored.value = false
  }

  function setType(type: RequestType) {
    draft.value.type = type
  }

  return { draft, savedAt, restored, dirty, reset, setType }
})

function isDirty(draft: RequestDraft): boolean {
  const blank = emptyDraft(draft.type)
  return (
    draft.onBehalf.kind !== 'self' ||
    draft.days.length > 0 ||
    draft.weeklySlots.length > 0 ||
    draft.startDate !== blank.startDate ||
    draft.endDate !== blank.endDate ||
    draft.reason !== blank.reason ||
    draft.comment.trim() !== '' ||
    draft.attachment !== null
  )
}
