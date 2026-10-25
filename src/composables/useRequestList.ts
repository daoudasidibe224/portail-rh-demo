import { computed, ref, watch } from 'vue'

import { usePagination } from '@/composables/usePagination'
import type { ISODate } from '@/domain/dates'
import { plural } from '@/domain/format'
import {
  DEFAULT_REQUEST_SORT,
  filterByPeriod,
  isPeriodActive,
  isPeriodInverted,
  sortRequests,
  type RequestSort,
} from '@/domain/requestFilters'
import { isOngoing } from '@/domain/schedule'
import type { RequestStatus } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

export type RequestListFilter = 'current' | 'all'

const REQUESTS_PER_PAGE = 10

// Filtres, tri et pagination de la liste « Mes demandes ».
export function useRequestList() {
  const portal = usePortalStore()

  const filter = ref<RequestListFilter>('current')
  const currentRequests = computed(() =>
    portal.myRequests.filter((r) => isOngoing(r, portal.today)),
  )
  const status = ref<RequestStatus | 'all'>('all')
  /* Tri et période : seulement dans « Toutes ». Un champ date vide = pas de borne. */
  const sort = ref<RequestSort>(DEFAULT_REQUEST_SORT)
  const from = ref<ISODate | ''>('')
  const to = ref<ISODate | ''>('')
  const periodInverted = computed(() => isPeriodInverted(from.value, to.value))
  const byStatus = computed(() =>
    status.value === 'all'
      ? portal.myRequests
      : portal.myRequests.filter((r) => r.status === status.value),
  )
  const listed = computed(() => {
    if (filter.value === 'current') return currentRequests.value
    return sortRequests(filterByPeriod(byStatus.value, from.value, to.value), sort.value)
  })
  /* Une période inversée compte comme filtre actif, même si elle ne filtre rien. */
  const filtersActive = computed(() => status.value !== 'all' || Boolean(from.value || to.value))
  const canReset = computed(() => filtersActive.value || sort.value !== DEFAULT_REQUEST_SORT)
  const showFilters = computed(
    () =>
      filter.value === 'all' && (portal.myRequests.length > REQUESTS_PER_PAGE || canReset.value),
  )
  const resultsLabel = computed(() => {
    if (filter.value !== 'all') return ''
    if (status.value === 'all' && !isPeriodActive(from.value, to.value)) return ''
    const n = listed.value.length
    return `${n} ${plural(n, 'demande')} sur ${portal.myRequests.length}`
  })
  const statusCounts = computed(() => {
    const counts: Record<RequestStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    }
    for (const r of portal.myRequests) counts[r.status] += 1
    return counts
  })

  function reset() {
    status.value = 'all'
    sort.value = DEFAULT_REQUEST_SORT
    from.value = ''
    to.value = ''
  }

  watch(filter, (value) => {
    if (value === 'current') status.value = 'all'
  })
  const pager = usePagination(listed, REQUESTS_PER_PAGE)
  watch([filter, status, sort, from, to], () => pager.go(1))

  return {
    filter,
    status,
    sort,
    from,
    to,
    currentRequests,
    periodInverted,
    listed,
    canReset,
    showFilters,
    resultsLabel,
    statusCounts,
    pager,
    reset,
  }
}
