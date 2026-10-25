<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

import RequestActionsBar from '@/components/detail/RequestActionsBar.vue'
import RequestDetails from '@/components/detail/RequestDetails.vue'
import RequestHistory from '@/components/detail/RequestHistory.vue'
import SentBanner from '@/components/detail/SentBanner.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useRequestDetail } from '@/composables/useRequestDetail'
import { describeType } from '@/domain/format'
import { fullName } from '@/domain/types'

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
  cancel,
  reject,
} = useRequestDetail(() => props.id)
</script>

<template>
  <NotFoundView v-if="notFound || !request" />
  <article v-else class="max-w-3xl pb-8">
    <RouterLink
      :to="isMine ? '/teletravail' : '/equipe'"
      class="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-900 print:hidden"
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
    <RequestHistory
      :request="request"
      :is-mine="isMine"
      :manager-name="managerName"
      :response-deadline="responseDeadline"
    />
    <RequestActionsBar
      :request="request"
      :is-mine="isMine"
      @approve="approve"
      @cancel="cancel"
      @reject="reject"
    />
  </article>
</template>
