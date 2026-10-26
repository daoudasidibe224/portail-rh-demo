<script setup lang="ts">
import { FileText } from 'lucide-vue-next'

import { describeQuantity, describeSchedule, formatBytes } from '@/lib/format'
import { REASONS, REQUEST_TYPES } from '@/lib/rules'
import type { TeleworkRequest } from '@/lib/types'

defineProps<{ request: TeleworkRequest }>()
</script>

<template>
  <section aria-labelledby="details-title" class="card mt-6 p-5 sm:p-6">
    <h2 id="details-title" class="sr-only">Détails</h2>
    <dl class="grid gap-4 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <dt class="text-sm text-ink-600">
          {{
            request.type === 'regular'
              ? 'Rythme'
              : request.type === 'mixed'
                ? 'Rythme et dates'
                : 'Dates'
          }}
        </dt>
        <dd class="mt-0.5 font-medium text-ink-900 first-letter:uppercase">
          {{ describeSchedule(request) }}
        </dd>
      </div>
      <div>
        <dt class="text-sm text-ink-600">Durée</dt>
        <dd class="mt-0.5 font-medium text-ink-900">{{ describeQuantity(request) }}</dd>
      </div>
      <div>
        <dt class="text-sm text-ink-600">Code RH</dt>
        <dd class="mt-0.5 font-medium text-ink-900">{{ REQUEST_TYPES[request.type].code }}</dd>
      </div>
      <div v-if="request.reason">
        <dt class="text-sm text-ink-600">Motif</dt>
        <dd class="mt-0.5 font-medium text-ink-900">{{ REASONS[request.reason] }}</dd>
      </div>
      <div v-if="request.costCenter">
        <dt class="text-sm text-ink-600">Centre de coût</dt>
        <dd class="mt-0.5 font-medium text-ink-900">{{ request.costCenter }}</dd>
      </div>
      <div v-if="request.recontactAllowed !== undefined">
        <dt class="text-sm text-ink-600">Recontact par le service RH</dt>
        <dd class="mt-0.5 font-medium text-ink-900">
          {{ request.recontactAllowed ? 'Accepté' : 'Non souhaité' }}
        </dd>
      </div>
      <div v-if="request.comment" class="sm:col-span-2">
        <dt class="text-sm text-ink-600">Message</dt>
        <dd class="mt-0.5 break-words text-ink-900">{{ request.comment }}</dd>
      </div>
      <div v-if="request.attachment" class="sm:col-span-2">
        <dt class="text-sm text-ink-600">Justificatif</dt>
        <dd class="mt-0.5 flex items-start gap-2 text-ink-900">
          <FileText class="mt-1 size-4 shrink-0 text-ink-600" aria-hidden="true" />
          <span class="min-w-0 break-words">
            {{ request.attachment.name }}
            <span class="text-ink-600">({{ formatBytes(request.attachment.size) }})</span>
          </span>
        </dd>
      </div>
    </dl>
  </section>
</template>
