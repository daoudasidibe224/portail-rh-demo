<script setup lang="ts">
import { RouterLink } from 'vue-router'

import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { describeQuantity, describeSchedule, describeType } from '@/domain/format'
import type { TeleworkRequest } from '@/domain/types'

defineProps<{
  requests: readonly TeleworkRequest[]
  nameOf: (request: TeleworkRequest) => string
}>()

defineEmits<{ approve: [request: TeleworkRequest]; reject: [request: TeleworkRequest] }>()
</script>

<template>
  <EmptyState v-if="!requests.length" title="Rien à valider">
    Toutes les demandes de votre équipe ont été traitées.
  </EmptyState>
  <ul v-else class="divide-y divide-ink-200" aria-live="polite">
    <li
      v-for="request in requests"
      :key="request.id"
      class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div class="min-w-0">
        <RouterLink
          :to="`/demandes/${request.id}`"
          class="link-quiet -my-2.5 inline-block py-2.5 font-semibold text-ink-900"
        >
          {{ nameOf(request) }}
        </RouterLink>
        <p class="text-sm text-ink-700">{{ describeType(request) }}</p>
        <p class="mt-0.5 text-sm text-ink-900 first-letter:uppercase">
          {{ describeSchedule(request) }} · {{ describeQuantity(request) }}
        </p>
        <p v-if="request.comment" class="mt-0.5 text-sm text-ink-600">{{ request.comment }}</p>
      </div>
      <div class="grid shrink-0 grid-cols-2 gap-2">
        <AppButton
          variant="solid"
          size="sm"
          :aria-label="`Valider la demande de ${nameOf(request)}`"
          @click="$emit('approve', request)"
        >
          Valider
        </AppButton>
        <AppButton
          variant="danger"
          size="sm"
          :aria-label="`Refuser la demande de ${nameOf(request)}`"
          @click="$emit('reject', request)"
        >
          Refuser
        </AppButton>
      </div>
    </li>
  </ul>
</template>
