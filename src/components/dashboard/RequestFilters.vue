<script setup lang="ts">
import { CircleAlert, RotateCcw } from 'lucide-vue-next'
import { useId } from 'vue'

import AppButton from '@/components/ui/AppButton.vue'
import type { ISODate } from '@/domain/dates'
import { REQUEST_SORTS, type RequestSort } from '@/domain/requestFilters'

defineProps<{ periodInverted: boolean; canReset: boolean }>()
const emit = defineEmits<{ reset: [] }>()
const sort = defineModel<RequestSort>('sort', { required: true })
const from = defineModel<ISODate | ''>('from', { required: true })
const to = defineModel<ISODate | ''>('to', { required: true })

const periodErrorId = useId()
</script>

<template>
  <form
    role="search"
    aria-label="Filtrer et trier mes demandes"
    class="flex flex-wrap items-start gap-x-4 gap-y-3 border-b border-ink-200 px-4 py-3 sm:px-5"
    @submit.prevent
  >
    <label
      class="flex items-center gap-2 text-sm font-medium text-ink-900 max-sm:grid max-sm:w-full max-sm:grid-cols-[3.5rem_1fr]"
    >
      Trier par
      <select v-model="sort" class="field-select min-h-10 w-auto min-w-0 py-2 text-sm">
        <option v-for="(label, key) in REQUEST_SORTS" :key="key" :value="key">
          {{ label }}
        </option>
      </select>
    </label>
    <fieldset class="flex min-w-0 flex-col gap-3 max-sm:w-full sm:flex-row sm:items-center">
      <legend class="sr-only">Période concernée</legend>
      <label
        class="flex items-center gap-2 text-sm font-medium text-ink-900 max-sm:grid max-sm:grid-cols-[3.5rem_1fr]"
      >
        Du
        <input
          v-model="from"
          type="date"
          :max="to || undefined"
          :aria-invalid="periodInverted || undefined"
          :aria-describedby="periodInverted ? periodErrorId : undefined"
          class="field-input min-h-10 min-w-0 px-3 py-2 text-base sm:w-auto sm:text-sm"
        />
      </label>
      <label
        class="flex items-center gap-2 text-sm font-medium text-ink-900 max-sm:grid max-sm:grid-cols-[3.5rem_1fr]"
      >
        Au
        <input
          v-model="to"
          type="date"
          :min="from || undefined"
          :aria-invalid="periodInverted || undefined"
          :aria-describedby="periodInverted ? periodErrorId : undefined"
          class="field-input min-h-10 min-w-0 px-3 py-2 text-base sm:w-auto sm:text-sm"
        />
      </label>
    </fieldset>
    <AppButton
      v-if="canReset"
      variant="ghost"
      size="sm"
      class="max-sm:-ml-3 max-sm:self-start"
      @click="emit('reset')"
    >
      <RotateCcw class="size-4" aria-hidden="true" />
      Réinitialiser les filtres
    </AppButton>
    <p
      v-if="periodInverted"
      :id="periodErrorId"
      role="alert"
      class="flex w-full items-start gap-2 text-sm font-medium text-brand-700"
    >
      <CircleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      La date «&nbsp;Au&nbsp;» est avant la date «&nbsp;Du&nbsp;». Corrigez l’une des deux : aucun
      filtre de période n’est appliqué.
    </p>
  </form>
</template>
