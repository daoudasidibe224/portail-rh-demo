<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { REQUEST_TYPE_ORDER, REQUEST_TYPES } from '@/domain/rules'
import type { RequestType } from '@/domain/types'

defineProps<{ invalid?: boolean; describedBy?: string }>()

const model = defineModel<RequestType>({ required: true })
const info = computed(() => REQUEST_TYPES[model.value])
</script>

<template>
  <div>
    <label for="request-type" class="field-label">
      Type de demande <span class="font-normal text-ink-600">(obligatoire)</span>
      <span class="ml-1 rounded-full bg-info-50 px-2 py-0.5 text-xs font-semibold text-info-700"
        >Nouveau</span
      >
    </label>
    <select
      id="request-type"
      v-model="model"
      aria-required="true"
      :aria-invalid="invalid || undefined"
      :aria-describedby="['type-info', describedBy].filter(Boolean).join(' ')"
      class="field-input mt-1.5"
    >
      <option value="" disabled>-- Veuillez choisir un type --</option>
      <option
        v-for="type in REQUEST_TYPE_ORDER"
        :key="type"
        :value="type"
        :disabled="REQUEST_TYPES[type].disabled"
      >
        {{ REQUEST_TYPES[type].choiceLabel }}
      </option>
    </select>
    <div id="type-info" class="mt-3 rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-700">
      {{ info.description }}
      <span v-if="info.rule" class="mt-1 block text-ink-600">{{ info.rule }}</span>
      <RouterLink
        v-if="model === 'absence'"
        to="/services/absences-diverses"
        class="mt-1 inline-flex min-h-10 items-center font-semibold text-ink-900 underline underline-offset-2"
      >
        Aller à « Absences diverses »
      </RouterLink>
    </div>
  </div>
</template>
