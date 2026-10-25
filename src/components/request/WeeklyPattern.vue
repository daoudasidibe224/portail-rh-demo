<script setup lang="ts">
import { formatDays } from '@/domain/format'
import { WEEKDAYS } from '@/domain/rules'
import { countWeeklyDays } from '@/domain/schedule'
import type { DayPeriod, Weekday, WeeklySlot } from '@/domain/types'

import PeriodChoice from './PeriodChoice.vue'

defineProps<{ id: string; describedBy?: string; invalid?: boolean }>()
const slots = defineModel<WeeklySlot[]>({ required: true })
const weekdays = Object.keys(WEEKDAYS).map(Number) as Weekday[]

function periodOf(weekday: Weekday): DayPeriod | null {
  return slots.value.find((s) => s.weekday === weekday)?.period ?? null
}

function setPeriod(weekday: Weekday, period: DayPeriod | null) {
  const others = slots.value.filter((s) => s.weekday !== weekday)
  slots.value = period
    ? [...others, { weekday, period }].sort((a, b) => a.weekday - b.weekday)
    : others
}
</script>

<template>
  <fieldset :id="id" :aria-describedby="describedBy" class="min-w-0">
    <legend class="mb-2 text-sm font-semibold text-ink-900">
      Jours de télétravail chaque semaine
      <span class="font-normal text-ink-600">({{ formatDays(countWeeklyDays(slots)) }})</span>
    </legend>
    <ul
      class="divide-y divide-ink-200 rounded-lg border bg-white px-3 sm:px-4"
      :class="invalid ? 'border-brand-700 ring-1 ring-brand-700' : 'border-ink-200'"
    >
      <li
        v-for="weekday in weekdays"
        :key="weekday"
        class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <span class="font-medium text-ink-900" aria-hidden="true">{{
          WEEKDAYS[weekday].label
        }}</span>
        <PeriodChoice
          :model-value="periodOf(weekday)"
          :legend="WEEKDAYS[weekday].label"
          :name="`weekday-${weekday}`"
          hide-legend
          allow-none
          @update:model-value="(p) => setPeriod(weekday, p)"
        />
      </li>
    </ul>
  </fieldset>
</template>
