<script setup lang="ts">
import { PERIODS } from '@/lib/rules'
import type { DayPeriod } from '@/lib/types'

withDefaults(
  defineProps<{
    legend: string
    name: string
    /** Légende masquée visuellement mais lue par les lecteurs d'écran. */
    hideLegend?: boolean
    /** Option supplémentaire « Sur site » (rythme régulier). */
    allowNone?: boolean
  }>(),
  { hideLegend: false, allowNone: false },
)
const model = defineModel<DayPeriod | null>({ required: true })

const options = (allowNone: boolean) => [
  ...(allowNone ? [{ value: null, label: 'Sur site' }] : []),
  ...(Object.keys(PERIODS) as DayPeriod[]).map((value) => ({ value, label: PERIODS[value].label })),
]
</script>

<template>
  <fieldset class="min-w-0">
    <legend :class="hideLegend ? 'sr-only' : 'mb-2 text-sm font-medium text-ink-900'">
      {{ legend }}
    </legend>
    <!-- 4 options sur une ligne dès 368 px, sinon 2 × 2. -->
    <div
      class="grid gap-1 rounded-xl bg-ink-100 p-1 sm:inline-grid sm:grid-flow-col sm:grid-cols-none"
      :class="
        allowNone
          ? 'grid-cols-2 min-[23rem]:grid-cols-[repeat(4,minmax(max-content,1fr))]'
          : 'grid-cols-[repeat(3,minmax(max-content,1fr))]'
      "
    >
      <label
        v-for="option in options(allowNone)"
        :key="String(option.value)"
        class="relative flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-1 text-center text-sm font-medium text-ink-700 transition-colors not-has-checked:hover:bg-ink-200 has-checked:bg-ink-900 has-checked:font-semibold has-checked:text-white has-checked:shadow-[0_1px_2px_rgb(0_0_0/0.25)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-info-700 sm:px-3"
      >
        <input
          v-model="model"
          type="radio"
          :name="name"
          :value="option.value"
          class="absolute inset-0 cursor-pointer opacity-0"
        />
        {{ option.label }}
      </label>
    </div>
  </fieldset>
</template>
