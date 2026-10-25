<script setup lang="ts">
import { useMediaQuery } from '@/composables/useMediaQuery'
import type { ISODate } from '@/domain/dates'
import type { PlanningRow } from '@/domain/teamPlanning'

import type { Pager } from './pager'
import TeamPager from './TeamPager.vue'
import TeamPresenceActions from './TeamPresenceActions.vue'
import TeamPresenceList from './TeamPresenceList.vue'
import TeamPresenceTable from './TeamPresenceTable.vue'
import TeamPresenceToolbar from './TeamPresenceToolbar.vue'

const query = defineModel<string>('query', { required: true })
const team = defineModel<string>('team', { required: true })

defineProps<{
  rows: readonly PlanningRow[]
  filteredCount: number
  memberCount: number
  perPage: number
  teams: readonly string[]
  weekDays: readonly ISODate[]
  weekNumber: number
  today: ISODate
  remoteCount: (index: number) => number
  pager: Pager
}>()
defineEmits<{ previous: []; next: []; export: []; print: [] }>()

/* Sous 48 rem, le planning devient une liste : une ligne par personne, cinq pastilles. */
const wide = useMediaQuery('(min-width: 48rem)')
</script>

<template>
  <h2 class="hidden px-5 pt-4 text-lg font-semibold text-ink-900 print:block">
    Présence de l’équipe, semaine {{ weekNumber }}
  </h2>
  <TeamPresenceToolbar
    v-model:query="query"
    v-model:team="team"
    :show-filters="memberCount > perPage || teams.length > 1"
    :show-search="memberCount > perPage"
    :teams="teams"
    :count="filteredCount"
    :week-number="weekNumber"
    @previous="$emit('previous')"
    @next="$emit('next')"
  />
  <TeamPresenceTable
    v-if="wide"
    :rows="rows"
    :week-days="weekDays"
    :week-number="weekNumber"
    :today="today"
    :remote-count="remoteCount"
  />
  <TeamPresenceList
    v-else
    :rows="rows"
    :total="filteredCount"
    :week-days="weekDays"
    :week-number="weekNumber"
    :today="today"
    :remote-count="remoteCount"
  />
  <TeamPresenceActions
    :can-export="filteredCount > 0"
    @export="$emit('export')"
    @print="$emit('print')"
  />
  <p v-if="!filteredCount" class="px-5 py-6 text-ink-700">
    Aucun collaborateur ne correspond à cette recherche.
  </p>
  <TeamPager :pager="pager" label="du planning" />
</template>
