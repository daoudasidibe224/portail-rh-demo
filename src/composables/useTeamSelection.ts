import { computed, ref, watch, type Ref } from 'vue'

import { plural } from '@/domain/format'
import { namesSummary } from '@/domain/teamPlanning'
import type { TriageFilters } from '@/domain/triage'
import type { TeleworkRequest } from '@/domain/types'

// Sélection des demandes à valider en masse, sur la page ou sur toute la liste filtrée.
export function useTeamSelection(
  list: Ref<readonly TeleworkRequest[]>,
  pageItems: Ref<readonly TeleworkRequest[]>,
  filters: Ref<TriageFilters>,
  nameOf: (request: TeleworkRequest) => string,
) {
  const selected = ref<Set<string>>(new Set())
  const clear = () => {
    selected.value = new Set()
  }
  watch(filters, clear, { deep: true })
  /* Une demande traitée par ailleurs ne reste pas sélectionnée. */
  watch(list, (items) => {
    const ids = new Set(items.map((r) => r.id))
    selected.value = new Set([...selected.value].filter((id) => ids.has(id)))
  })

  function toggleOne(id: string) {
    const next = new Set(selected.value)
    if (!next.delete(id)) next.add(id)
    selected.value = next
  }
  function togglePage(checked: boolean) {
    const next = new Set(selected.value)
    for (const r of pageItems.value) {
      if (checked) next.add(r.id)
      else next.delete(r.id)
    }
    selected.value = next
  }
  const pageFullySelected = computed(
    () => pageItems.value.length > 0 && pageItems.value.every((r) => selected.value.has(r.id)),
  )
  const canSelectAll = computed(
    () => pageFullySelected.value && list.value.length > selected.value.size,
  )
  function selectAll() {
    selected.value = new Set(list.value.map((r) => r.id))
  }

  const bulkOpen = ref(false)
  const bulkRequests = computed(() => list.value.filter((r) => selected.value.has(r.id)))
  const bulkTitle = computed(
    () => `Valider ${bulkRequests.value.length} ${plural(bulkRequests.value.length, 'demande')} ?`,
  )
  const bulkDescription = computed(() => namesSummary(bulkRequests.value.map(nameOf)))

  return {
    selected,
    clear,
    toggleOne,
    togglePage,
    canSelectAll,
    selectAll,
    bulkOpen,
    bulkRequests,
    bulkTitle,
    bulkDescription,
  }
}
