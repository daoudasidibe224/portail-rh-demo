<script setup lang="ts">
import { RouterLink } from 'vue-router'

import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { formatDate } from '@/lib/dateFormat'
import { describeQuantity, describeSchedule } from '@/lib/format'
import { REASONS, REQUEST_TYPES } from '@/lib/rules'
import type { TeleworkRequest } from '@/lib/types'

defineProps<{ requests: readonly TeleworkRequest[]; caption: string }>()

// Téléphone : une carte par demande plutôt qu'un tableau qui défile.
const wide = useMediaQuery('(min-width: 48rem)')

function typeLine(request: TeleworkRequest): string {
  const type = REQUEST_TYPES[request.type].label
  return request.reason ? `${type} · ${REASONS[request.reason]}` : type
}

function sentOn(request: TeleworkRequest): string {
  return formatDate(request.createdAt)
}
</script>

<template>
  <div v-if="wide" class="overflow-x-auto">
    <table class="zebra w-full min-w-[36rem] text-left text-sm">
      <caption class="sr-only">
        {{
          caption
        }}
      </caption>
      <thead>
        <tr class="border-b border-ink-200 bg-ink-50 text-ink-600">
          <th scope="col" class="px-4 py-2 font-medium sm:px-5">Demande</th>
          <th scope="col" class="px-3 py-2 font-medium">Durée</th>
          <th scope="col" class="px-3 py-2 font-medium">Envoyée le</th>
          <th scope="col" class="px-4 py-2 font-medium sm:px-5">Statut</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-ink-200">
        <tr v-for="r in requests" :key="r.id" class="align-top">
          <th scope="row" class="px-4 py-2 font-normal sm:px-5">
            <RouterLink
              :to="`/demandes/${r.id}`"
              class="link-quiet -my-2.5 inline-block py-2.5 font-medium text-ink-900 first-letter:uppercase"
            >
              {{ describeSchedule(r) }}
            </RouterLink>
            <span class="block text-ink-600">{{ typeLine(r) }}</span>
          </th>
          <td class="px-3 py-2 whitespace-nowrap text-ink-700">{{ describeQuantity(r) }}</td>
          <td class="px-3 py-2 whitespace-nowrap text-ink-600">{{ sentOn(r) }}</td>
          <td class="px-4 py-2 sm:px-5"><StatusBadge :status="r.status" /></td>
        </tr>
      </tbody>
    </table>
  </div>

  <ul v-else class="divide-y divide-ink-200" :aria-label="caption">
    <li v-for="r in requests" :key="r.id" class="px-4 py-3">
      <div class="flex items-start justify-between gap-3">
        <RouterLink
          :to="`/demandes/${r.id}`"
          class="link-quiet -my-2.5 inline-block py-2.5 font-medium text-ink-900 first-letter:uppercase"
        >
          {{ describeSchedule(r) }}
        </RouterLink>
        <StatusBadge :status="r.status" class="shrink-0 pt-0.5" />
      </div>
      <p class="text-sm text-ink-600">{{ typeLine(r) }}</p>
      <p class="mt-0.5 text-sm text-ink-600">
        {{ describeQuantity(r) }} · envoyée le {{ sentOn(r) }}
      </p>
    </li>
  </ul>
</template>
