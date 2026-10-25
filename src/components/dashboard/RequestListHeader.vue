<script setup lang="ts">
import { ref } from 'vue'

import type { RequestListFilter } from '@/composables/useRequestList'
import { STATUSES } from '@/domain/rules'
import type { RequestStatus } from '@/domain/types'

defineProps<{
  currentCount: number
  totalCount: number
  statusCounts: Record<RequestStatus, number>
}>()
const filter = defineModel<RequestListFilter>('filter', { required: true })
const status = defineModel<RequestStatus | 'all'>('status', { required: true })

const statusSelect = ref<HTMLSelectElement | null>(null)
defineExpose({ focusStatus: () => statusSelect.value?.focus() })
</script>

<template>
  <div class="mb-3 flex flex-wrap items-end justify-between gap-3">
    <h2 id="requests-title" class="text-xl font-semibold text-ink-900">Mes demandes</h2>
    <div class="flex flex-wrap items-center gap-3">
      <label
        v-if="filter === 'all'"
        class="flex items-center gap-2 text-sm font-medium text-ink-900"
      >
        Statut
        <select
          ref="statusSelect"
          v-model="status"
          class="field-select min-h-10 w-auto py-2 text-sm"
        >
          <option value="all">Tous</option>
          <option v-for="(info, key) in STATUSES" :key="key" :value="key">
            {{ info.label }} ({{ statusCounts[key] }})
          </option>
        </select>
      </label>
      <div role="group" aria-label="Filtrer les demandes" class="segmented">
        <button
          v-for="option in [
            { value: 'current', label: `En cours (${currentCount})` },
            { value: 'all', label: `Toutes (${totalCount})` },
          ] as const"
          :key="option.value"
          type="button"
          :aria-pressed="filter === option.value"
          class="segmented-item"
          @click="filter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>
