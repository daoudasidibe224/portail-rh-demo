<script setup lang="ts">
import { computed } from 'vue'

import { useRequestSummary } from '@/composables/useRequestSummary'
import { useRequestTarget } from '@/composables/useRequestTarget'
import {
  describeQuantity,
  describeSchedule,
  formatBytes,
  formatDays,
  formatHours,
} from '@/lib/format'
import { REASONS, REQUEST_TYPES } from '@/lib/rules'
import { fullName } from '@/lib/types'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

// `detailed` ajoute le demandeur : réservé à l'étape de vérification.
defineProps<{ detailed?: boolean }>()

const portal = usePortalStore()
const drafts = useDraftStore()
const { balanceAfter, requestedHours, usesBalance } = useRequestSummary()
const { forOther, person } = useRequestTarget()

const draft = computed(() => drafts.draft)
const costCenter = computed(() => draft.value.costCenter || person.value.costCenter)
</script>

<template>
  <dl class="grid gap-x-6 gap-y-3 text-sm" :class="detailed ? 'sm:grid-cols-2' : ''">
    <div>
      <dt class="text-ink-600">Type</dt>
      <dd class="font-medium text-ink-900">{{ REQUEST_TYPES[draft.type].label }}</dd>
    </div>
    <div :class="detailed ? 'sm:col-span-2' : ''">
      <dt class="text-ink-600">
        {{
          draft.type === 'regular' ? 'Rythme' : draft.type === 'mixed' ? 'Rythme et dates' : 'Dates'
        }}
      </dt>
      <dd class="font-medium text-ink-900 first-letter:uppercase">
        {{ describeSchedule(draft) }}
      </dd>
    </div>
    <div>
      <dt class="text-ink-600">Durée</dt>
      <dd class="font-medium text-ink-900">
        {{ describeQuantity(draft) }}
        <span v-if="requestedHours" class="font-normal text-ink-700">({{ requestedHours }})</span>
      </dd>
    </div>
    <div v-if="usesBalance">
      <dt class="text-ink-600">Solde après la demande</dt>
      <dd class="font-medium" :class="balanceAfter < 0 ? 'text-brand-700' : 'text-ink-900'">
        {{
          balanceAfter < 0
            ? `Dépassement de ${formatDays(-balanceAfter)}`
            : `${formatDays(balanceAfter)} (${formatHours(balanceAfter)})`
        }}
      </dd>
    </div>
    <div>
      <dt class="text-ink-600">Validation par</dt>
      <dd class="font-medium text-ink-900">
        {{
          forOther ? 'Vous, à l’envoi' : portal.manager ? fullName(portal.manager) : 'Service RH'
        }}
      </dd>
    </div>
    <template v-if="detailed">
      <div>
        <dt class="text-ink-600">Demandeur</dt>
        <dd class="font-medium text-ink-900">
          {{ person.name }}, matricule {{ person.matricule }}
        </dd>
      </div>
      <div>
        <dt class="text-ink-600">Équipe</dt>
        <dd class="font-medium text-ink-900">{{ person.team }}</dd>
      </div>
      <div>
        <dt class="text-ink-600">Centre de coût</dt>
        <dd class="font-medium text-ink-900">{{ costCenter }}</dd>
      </div>
      <div v-if="draft.reason">
        <dt class="text-ink-600">Motif</dt>
        <dd class="font-medium text-ink-900">{{ REASONS[draft.reason] }}</dd>
      </div>
      <div v-if="draft.attachment">
        <dt class="text-ink-600">Justificatif</dt>
        <dd class="font-medium break-words text-ink-900">
          {{ draft.attachment.name }}
          <span class="font-normal text-ink-700">({{ formatBytes(draft.attachment.size) }})</span>
        </dd>
      </div>
      <div v-if="draft.comment.trim()" class="sm:col-span-2">
        <dt class="text-ink-600">Message</dt>
        <dd class="break-words whitespace-pre-line text-ink-900">{{ draft.comment.trim() }}</dd>
      </div>
    </template>
  </dl>
</template>
