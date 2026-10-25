<script setup lang="ts">
import { RouterLink } from 'vue-router'

import RequestTable from '@/components/request/RequestTable.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { RequestListFilter } from '@/composables/useRequestList'
import type { usePagination } from '@/composables/usePagination'
import type { TeleworkRequest } from '@/domain/types'

defineProps<{
  filter: RequestListFilter
  resultsLabel: string
  totalCount: number
  pager: ReturnType<typeof usePagination<TeleworkRequest>>
}>()
</script>

<template>
  <p
    v-if="filter === 'all'"
    role="status"
    class="text-sm text-ink-700"
    :class="resultsLabel && 'border-b border-ink-200 px-4 py-2 sm:px-5'"
  >
    {{ resultsLabel }}
  </p>
  <template v-if="pager.total.value">
    <RequestTable
      :requests="pager.visible.value"
      :caption="filter === 'current' ? 'Mes demandes en cours' : 'Toutes mes demandes'"
    />
    <AppPagination
      :page="pager.page.value"
      :page-count="pager.pageCount.value"
      :from="pager.from.value"
      :to="pager.to.value"
      :total="pager.total.value"
      label="de mes demandes"
      @update:page="pager.go"
    />
  </template>
  <EmptyState v-else-if="filter === 'all' && totalCount" title="Aucune demande ne correspond.">
    Modifiez les filtres ou réinitialisez-les pour tout voir.
  </EmptyState>
  <EmptyState v-else :title="filter === 'current' ? 'Aucune demande en cours.' : 'Aucune demande.'">
    Besoin de télétravailler ?
    <RouterLink to="/demandes/nouvelle" class="link-action">Faire une demande</RouterLink>
  </EmptyState>
</template>
