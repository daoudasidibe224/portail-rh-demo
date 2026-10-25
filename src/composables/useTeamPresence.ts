import { computed, ref, watch } from 'vue'

import { usePagination } from '@/composables/usePagination'
import { addDays, isoWeekNumber, startOfWeek } from '@/domain/dates'
import { filterPlanningRows, planningRows, remoteCountAt, teamNames } from '@/domain/teamPlanning'
import { usePortalStore } from '@/stores/portal'

export const MEMBERS_PER_PAGE = 15

// Planning de présence : semaine affichée, recherche, filtre d'équipe et pagination.
export function useTeamPresence() {
  const portal = usePortalStore()

  const weekOffset = ref(0)
  const monday = computed(() => addDays(startOfWeek(portal.today), weekOffset.value * 7))
  const weekDays = computed(() => [0, 1, 2, 3, 4].map((i) => addDays(monday.value, i)))
  const weekNumber = computed(() => isoWeekNumber(monday.value))

  const memberQuery = ref('')
  const teamFilter = ref('all')
  const teams = computed(() => teamNames(portal.teamMembers))

  const allRows = computed(() => planningRows(portal.teamMembers, portal.requests, weekDays.value))
  const remoteCount = (index: number) => remoteCountAt(allRows.value, index)
  const filteredRows = computed(() =>
    filterPlanningRows(allRows.value, portal.teamMembers, memberQuery.value, teamFilter.value),
  )

  const pager = usePagination(filteredRows, MEMBERS_PER_PAGE)
  watch([memberQuery, teamFilter], () => pager.go(1))

  return {
    weekOffset,
    monday,
    weekDays,
    weekNumber,
    memberQuery,
    teamFilter,
    teams,
    filteredRows,
    remoteCount,
    pager,
  }
}
