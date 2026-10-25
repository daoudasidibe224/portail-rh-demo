<script setup lang="ts">
import EmptyState from '@/components/ui/EmptyState.vue'
import type { TriageFilters } from '@/domain/triage'
import type { TeleworkRequest } from '@/domain/types'

import type { Pager } from './pager'
import PendingTable from './PendingTable.vue'
import TeamPager from './TeamPager.vue'
import TeamPendingFilters from './TeamPendingFilters.vue'
import TeamSelectionBar from './TeamSelectionBar.vue'

const filters = defineModel<TriageFilters>('filters', { required: true })

defineProps<{
  empty: boolean
  filtersVisible: boolean
  resultsLabel: string
  pager: Pager
  pageRequests: readonly TeleworkRequest[]
  selected: ReadonlySet<string>
  canSelectAll: boolean
  nameOf: (request: TeleworkRequest) => string
  remote: (request: TeleworkRequest) => { count: number; total: number } | null
}>()

defineEmits<{
  toggle: [id: string]
  'toggle-page': [checked: boolean]
  approve: [request: TeleworkRequest]
  reject: [request: TeleworkRequest]
  'approve-selected': []
  'clear-selection': []
  'select-all': []
}>()
</script>

<template>
  <EmptyState v-if="empty" title="Tout est traité.">
    Les nouvelles demandes apparaîtront ici.
  </EmptyState>
  <template v-else>
    <TeamPendingFilters v-if="filtersVisible" v-model:filters="filters" />
    <p
      v-if="resultsLabel"
      class="border-b border-ink-200 px-4 py-2 text-sm text-ink-700 sm:px-5"
      role="status"
    >
      {{ resultsLabel }}
    </p>

    <TeamSelectionBar
      v-if="selected.size"
      :count="selected.size"
      :total="pager.total.value"
      :can-select-all="canSelectAll"
      @approve="$emit('approve-selected')"
      @clear="$emit('clear-selection')"
      @select-all="$emit('select-all')"
    />

    <template v-if="pager.total.value">
      <PendingTable
        :requests="pageRequests"
        :selected="selected"
        :name-of="nameOf"
        :remote="remote"
        @toggle="$emit('toggle', $event)"
        @toggle-page="$emit('toggle-page', $event)"
        @approve="$emit('approve', $event)"
        @reject="$emit('reject', $event)"
      />
      <TeamPager :pager="pager" label="des demandes à valider" />
    </template>
    <EmptyState v-else title="Aucune demande ne correspond.">
      Modifiez la recherche ou le type pour les retrouver.
    </EmptyState>
  </template>
</template>
