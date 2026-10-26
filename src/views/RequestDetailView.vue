<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

import RequestActionsBar from '@/components/detail/RequestActionsBar.vue'
import RequestDetails from '@/components/detail/RequestDetails.vue'
import SentBanner from '@/components/detail/SentBanner.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useRequestDetail } from '@/composables/useRequestDetail'
import { formatFull } from '@/lib/dateFormat'
import { describeType } from '@/lib/format'
import { RULES } from '@/lib/rules'
import { fullName } from '@/lib/types'

import NotFoundView from './NotFoundView.vue'

const props = defineProps<{ id: string }>()
const {
  heading,
  request,
  author,
  isMine,
  notFound,
  justSent,
  responseDeadline,
  managerName,
  approve,
  reject,
} = useRequestDetail(() => props.id)
</script>

<template>
  <NotFoundView v-if="notFound || !request" />
  <article v-else class="max-w-3xl pb-8">
    <RouterLink
      :to="isMine ? '/teletravail' : '/equipe'"
      class="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-900"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      {{ isMine ? 'Mon télétravail' : 'Mon équipe' }}
    </RouterLink>

    <SentBanner v-if="justSent" :manager-name="managerName" />

    <header class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <p class="text-sm text-ink-600">Réf. {{ request.reference }}</p>
        <h1
          id="page-title"
          ref="heading"
          tabindex="-1"
          class="mt-1 font-condensed text-3xl font-semibold break-words text-ink-900"
        >
          {{ describeType(request) }}
        </h1>
        <p v-if="!isMine && author" class="mt-1 text-ink-700">
          {{ fullName(author) }}, {{ author.jobTitle.toLowerCase() }}
        </p>
      </div>
      <StatusBadge :status="request.status" class="self-start" />
    </header>

    <RequestDetails :request="request" />
    <p v-if="request.status === 'pending'" class="mt-4 text-ink-700">
      Réponse attendue sous {{ RULES.responseBusinessDays }} jours ouvrés, soit avant le
      {{ formatFull(responseDeadline) }}.
    </p>
    <RequestActionsBar
      v-if="!isMine && request.status === 'pending'"
      :request="request"
      @approve="approve"
      @reject="reject"
    />
  </article>
</template>
