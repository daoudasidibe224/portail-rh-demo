<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import { nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BalanceSummary from '@/components/dashboard/BalanceSummary.vue'
import RequestFilters from '@/components/dashboard/RequestFilters.vue'
import RequestListHeader from '@/components/dashboard/RequestListHeader.vue'
import RequestListResults from '@/components/dashboard/RequestListResults.vue'
import WeekPlanner from '@/components/dashboard/WeekPlanner.vue'
import QuickRequestActions from '@/components/request/QuickRequestActions.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { useRequestList } from '@/composables/useRequestList'
import { formatLong } from '@/domain/dateFormat'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const heading = usePageHeading()
const list = useRequestList()

const listHeader = ref<InstanceType<typeof RequestListHeader> | null>(null)
async function resetFilters() {
  list.reset()
  // Le bouton disparaît : le focus passe au premier filtre.
  await nextTick()
  listHeader.value?.focusStatus()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <PageTitle ref="heading">Mon télétravail</PageTitle>
        <p class="mt-1 text-ink-600 first-letter:uppercase">{{ formatLong(portal.today) }}</p>
        <p>
          <RouterLink
            to="/teletravail/charte"
            class="inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-700 underline underline-offset-2 hover:text-ink-900"
          >
            <BookOpen class="size-4" aria-hidden="true" />
            Lire la charte du télétravail
          </RouterLink>
        </p>
      </div>
      <QuickRequestActions />
    </div>

    <div class="card">
      <WeekPlanner
        :requests="portal.requests"
        :employee-id="portal.currentUser.id"
        :today="portal.today"
      />
    </div>

    <BalanceSummary />

    <section aria-labelledby="requests-title">
      <RequestListHeader
        ref="listHeader"
        v-model:filter="list.filter.value"
        v-model:status="list.status.value"
        :current-count="list.currentRequests.value.length"
        :total-count="portal.myRequests.length"
        :status-counts="list.statusCounts.value"
      />
      <div class="card overflow-hidden">
        <RequestFilters
          v-if="list.showFilters.value"
          v-model:sort="list.sort.value"
          v-model:from="list.from.value"
          v-model:to="list.to.value"
          :period-inverted="list.periodInverted.value"
          :can-reset="list.canReset.value"
          @reset="resetFilters"
        />
        <RequestListResults
          :filter="list.filter.value"
          :results-label="list.resultsLabel.value"
          :total-count="portal.myRequests.length"
          :pager="list.pager"
        />
      </div>
    </section>
  </div>
</template>
