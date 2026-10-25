<script setup lang="ts">
import { ArrowRight, ClipboardCheck } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import ServiceGroups from '@/components/home/ServiceGroups.vue'
import TodayStatus from '@/components/home/TodayStatus.vue'
import NewsListItem from '@/components/news/NewsListItem.vue'
import QuickRequestActions from '@/components/request/QuickRequestActions.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { formatLong } from '@/domain/dates'
import { plural } from '@/domain/format'
import { latestNews } from '@/domain/news'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const heading = usePageHeading()

const news = latestNews(3)
const pendingCount = computed(() => portal.teamPending.length)
</script>

<template>
  <div class="space-y-8">
    <header>
      <PageTitle ref="heading">Bonjour {{ portal.currentUser.firstName }}</PageTitle>
      <p class="mt-1 text-ink-600 first-letter:uppercase">{{ formatLong(portal.today) }}</p>
    </header>

    <section aria-labelledby="today-title" class="space-y-3">
      <h2 id="today-title" class="sr-only">Mon télétravail</h2>
      <div class="card">
        <TodayStatus
          :requests="portal.requests"
          :employee-id="portal.currentUser.id"
          :today="portal.today"
        />
        <div class="border-t border-ink-200 px-4 py-4 sm:px-5">
          <QuickRequestActions />
        </div>
      </div>
      <RouterLink
        v-if="pendingCount"
        to="/equipe"
        class="card press flex min-h-14 items-center gap-3 border-warning-700 bg-warning-50 px-4 py-3 text-ink-900 hover:bg-white active:bg-ink-50 sm:px-5"
      >
        <ClipboardCheck class="size-5 shrink-0 text-warning-700" aria-hidden="true" />
        <span class="font-semibold underline underline-offset-2">
          {{ pendingCount }} {{ plural(pendingCount, 'demande') }} à valider
        </span>
        <ArrowRight class="ml-auto size-4 shrink-0" aria-hidden="true" />
      </RouterLink>
    </section>

    <div class="grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
      <section aria-labelledby="news-title" class="space-y-3">
        <div class="flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 id="news-title" class="text-xl font-semibold text-ink-900">Actualités</h2>
          <RouterLink
            to="/actualites"
            class="link-action inline-flex min-h-10 items-center gap-1.5"
          >
            Toutes les actualités
            <ArrowRight class="size-4" aria-hidden="true" />
          </RouterLink>
        </div>
        <ul class="card divide-y divide-ink-200 overflow-hidden">
          <NewsListItem
            v-for="article in news"
            :key="article.slug"
            :article="article"
            :level="3"
            compact
          />
        </ul>
      </section>

      <section aria-labelledby="services-title" class="space-y-3">
        <h2
          id="services-title"
          class="flex min-h-10 items-center text-xl font-semibold text-ink-900"
        >
          Services RH
        </h2>
        <ServiceGroups />
      </section>
    </div>
  </div>
</template>
