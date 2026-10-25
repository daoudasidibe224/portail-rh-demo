<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

import BalanceSummary from '@/components/dashboard/BalanceSummary.vue'
import QuickRequestActions from '@/components/request/QuickRequestActions.vue'
import RequestTable from '@/components/request/RequestTable.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { formatLong } from '@/domain/dateFormat'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const heading = usePageHeading()
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

    <BalanceSummary />

    <section aria-labelledby="requests-title">
      <h2 id="requests-title" class="mb-3 text-xl font-semibold text-ink-900">Mes demandes</h2>
      <div class="card overflow-hidden">
        <RequestTable
          v-if="portal.myRequests.length"
          :requests="portal.myRequests"
          caption="Mes demandes"
        />
        <EmptyState v-else title="Aucune demande.">
          Besoin de télétravailler ?
          <RouterLink to="/demandes/nouvelle" class="link-action">Faire une demande</RouterLink>
        </EmptyState>
      </div>
    </section>
  </div>
</template>
