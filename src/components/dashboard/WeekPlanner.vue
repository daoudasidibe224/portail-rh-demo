<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import IconButton from '@/components/ui/IconButton.vue'
import { addDays, isoWeekNumber, parseISO, startOfWeek, type ISODate } from '@/domain/dates'
import { holidayName } from '@/domain/holidays'
import { formatDayMonth } from '@/domain/dateFormat'
import { PERIODS } from '@/domain/rules'
import { entryFor } from '@/domain/schedule'
import type { TeleworkRequest } from '@/domain/types'

const props = defineProps<{
  requests: readonly TeleworkRequest[]
  employeeId: string
  today: ISODate
}>()

const offset = ref(0)
const monday = computed(() => addDays(startOfWeek(props.today), offset.value * 7))

const weekdayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', timeZone: 'UTC' })
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' })

const title = computed(() => {
  const friday = addDays(monday.value, 4)
  const from = parseISO(monday.value).getUTCDate()
  const sameMonth = monday.value.slice(5, 7) === friday.slice(5, 7)
  const range = sameMonth
    ? `du ${from} au ${formatDayMonth(friday)}`
    : `du ${from} ${monthFormatter.format(parseISO(monday.value))} au ${formatDayMonth(friday)}`
  return `Semaine ${isoWeekNumber(monday.value)}, ${range}`
})

const days = computed(() =>
  [0, 1, 2, 3, 4].map((i) => {
    const date = addDays(monday.value, i)
    const holiday = holidayName(date)
    const entry = entryFor(props.requests, props.employeeId, date)
    let kind: 'office' | 'remote' | 'pending' | 'holiday' = 'office'
    if (holiday) kind = 'holiday'
    else if (entry) kind = entry.request.status === 'pending' ? 'pending' : 'remote'
    const period = entry && entry.period !== 'day' ? `, ${PERIODS[entry.period].short}` : ''
    const label = {
      office: 'Sur site',
      remote: `Télétravail${period}`,
      pending: `Demandé${period}`,
      holiday: holiday ?? 'Férié',
    }[kind]
    return {
      date,
      kind,
      label,
      weekday: weekdayFormatter.format(parseISO(date)),
      day: parseISO(date).getUTCDate(),
      isToday: date === props.today,
      isPast: date < props.today,
    }
  }),
)

const cellClass = {
  office: 'bg-white border-ink-200',
  remote: 'bg-success-50 border-success-700/30',
  pending:
    'border-warning-700/40 bg-[repeating-linear-gradient(-45deg,var(--color-warning-50)_0_6px,var(--color-white)_6px_12px)]',
  holiday: 'bg-ink-100 border-ink-200',
}
const labelClass = {
  office: 'text-ink-600',
  remote: 'font-semibold text-success-700',
  pending: 'font-semibold text-warning-700',
  holiday: 'text-ink-600',
}
</script>

<template>
  <section aria-labelledby="week-title">
    <div class="flex items-center justify-between gap-3 px-4 pt-2 pb-1 sm:px-5">
      <h2 id="week-title" class="text-sm font-semibold text-ink-900" aria-live="polite">
        {{ title }}
      </h2>
      <div class="flex items-center">
        <button
          v-if="offset !== 0"
          type="button"
          class="mr-1 min-h-10 rounded-lg px-2 text-sm font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900"
          @click="offset = 0"
        >
          Cette semaine
        </button>
        <IconButton label="Semaine précédente" @click="offset--">
          <ChevronLeft class="size-5" aria-hidden="true" />
        </IconButton>
        <IconButton label="Semaine suivante" @click="offset++">
          <ChevronRight class="size-5" aria-hidden="true" />
        </IconButton>
      </div>
    </div>

    <ol class="grid grid-cols-1 gap-2 px-4 pb-4 min-[480px]:grid-cols-5 sm:px-5">
      <li
        v-for="d in days"
        :key="d.date"
        :aria-current="d.isToday ? 'date' : undefined"
        class="relative flex items-center gap-3 rounded-lg border px-3 py-2.5 min-[480px]:block"
        :class="[cellClass[d.kind], d.isToday ? 'ring-2 ring-brand-600' : '']"
      >
        <span
          class="flex w-28 shrink-0 items-baseline gap-1.5 text-sm min-[480px]:w-auto"
          :class="d.isPast ? 'text-ink-600' : 'text-ink-900'"
        >
          <span class="font-semibold">{{ d.day }}</span>
          <span class="first-letter:uppercase">{{ d.weekday }}</span>
          <span v-if="d.isToday" class="sr-only">, aujourd’hui</span>
        </span>
        <span class="text-sm min-[480px]:mt-0.5 min-[480px]:block" :class="labelClass[d.kind]">
          {{ d.label }}
        </span>
      </li>
    </ol>
  </section>
</template>
