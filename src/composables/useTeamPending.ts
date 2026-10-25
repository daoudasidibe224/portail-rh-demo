import { computed, ref, watch } from 'vue'

import { usePagination } from '@/composables/usePagination'
import { useTeamAuthors } from '@/composables/useTeamAuthors'
import { plural } from '@/domain/format'
import { firstDate } from '@/domain/schedule'
import {
  groupByEmployee,
  teammatesRemoteOn,
  triagePending,
  type TriageFilters,
} from '@/domain/triage'
import type { TeleworkRequest } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

const PENDING_PER_PAGE = 10

// Liste des demandes à valider : filtres, tri, pagination et compteur de collègues à distance.
export function useTeamPending() {
  const portal = usePortalStore()
  const { authorName, sortName } = useTeamAuthors()

  const filters = ref<TriageFilters>({ query: '', type: 'all', sort: 'start' })
  const list = computed(() =>
    triagePending(portal.teamPending, authorName, filters.value, sortName),
  )
  const pager = usePagination(list, PENDING_PER_PAGE)
  watch(filters, () => pager.go(1), { deep: true })

  /* Index par collaborateur, pour ne pas parcourir toutes les demandes à chaque case. */
  const byEmployee = computed(() => groupByEmployee(portal.requests))
  const memberIds = computed(() => portal.teamMembers.map((m) => m.id))
  function remoteFor(request: TeleworkRequest) {
    const date = firstDate(request)
    if (!date) return null
    return {
      count: teammatesRemoteOn(byEmployee.value, memberIds.value, date, request.employeeId),
      total: Math.max(0, memberIds.value.length - 1),
    }
  }

  const resultsLabel = computed(() =>
    list.value.length === portal.teamPending.length
      ? ''
      : `${list.value.length} sur ${portal.teamPending.length} ${plural(portal.teamPending.length, 'demande')}`,
  )
  const filtersVisible = computed(
    () =>
      portal.teamPending.length > PENDING_PER_PAGE ||
      filters.value.query !== '' ||
      filters.value.type !== 'all',
  )

  return { filters, list, pager, authorName, remoteFor, resultsLabel, filtersVisible }
}
