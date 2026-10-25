<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed } from 'vue'

import type { ISODate } from '@/domain/dates'
import { formatLong } from '@/domain/dateFormat'
import { formatDays } from '@/domain/format'
import { countDays } from '@/domain/schedule'
import type { DayPeriod, RequestedDay } from '@/domain/types'

import { DEFAULT_PERIOD } from '@/domain/rules'
import PeriodChoice from './PeriodChoice.vue'

// Jours choisis dans le calendrier, avec la durée de chacun (journée, matin, après-midi).
const days = defineModel<RequestedDay[]>({ required: true })

const sorted = computed(() => [...days.value].sort((a, b) => a.date.localeCompare(b.date)))

function setPeriod(date: ISODate, period: DayPeriod | null) {
  days.value = days.value.map((d) =>
    d.date === date ? { ...d, period: period ?? DEFAULT_PERIOD } : d,
  )
}

function remove(date: ISODate) {
  days.value = days.value.filter((d) => d.date !== date)
}
</script>

<template>
  <div class="self-start rounded-lg border border-ink-200 bg-white p-1.5 sm:p-3">
    <h3 class="flex min-h-10 items-center justify-between pb-2 font-semibold text-ink-900">
      Jours choisis
      <span class="text-sm font-normal text-ink-600">{{ formatDays(countDays(days)) }}</span>
    </h3>
    <p
      v-if="!sorted.length"
      class="rounded-lg border border-dashed border-ink-400 p-6 text-center text-sm text-ink-600"
    >
      Choisissez les jours dans le calendrier.
    </p>
    <ul v-else class="space-y-2">
      <li
        v-for="day in sorted"
        :key="day.date"
        class="rounded-lg border border-ink-200 bg-ink-50 p-3"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium text-ink-900 first-letter:uppercase">{{
            formatLong(day.date)
          }}</span>
          <button
            type="button"
            class="-my-1 grid size-10 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            :aria-label="`Retirer le ${formatLong(day.date)}`"
            @click="remove(day.date)"
          >
            <X class="size-4" aria-hidden="true" />
          </button>
        </div>
        <PeriodChoice
          class="mt-2"
          :model-value="day.period"
          :legend="`Durée du ${formatLong(day.date)}`"
          :name="`period-${day.date}`"
          hide-legend
          @update:model-value="(p) => setPeriod(day.date, p)"
        />
      </li>
    </ul>
  </div>
</template>
