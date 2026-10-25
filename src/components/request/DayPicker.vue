<script setup lang="ts">
import { parseDate, type DateValue } from '@internationalized/date'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
} from 'reka-ui'
import { computed } from 'vue'

import { isWeekend, type ISODate } from '@/domain/dates'
import { holidayName } from '@/domain/holidays'
import type { RequestedDay } from '@/domain/types'

import { DEFAULT_PERIOD } from './defaults'
import SelectedDays from './SelectedDays.vue'

defineProps<{
  id: string
  today: ISODate
  describedBy?: string
  invalid?: boolean
}>()
const days = defineModel<RequestedDay[]>({ required: true })

const selection = computed<DateValue[]>({
  get: () => days.value.map((d) => parseDate(d.date)),
  set: (values) => {
    const previous = new Map(days.value.map((d) => [d.date, d.period]))
    days.value = (values ?? [])
      .map((v) => v.toString())
      .sort()
      .map((date) => ({ date, period: previous.get(date) ?? DEFAULT_PERIOD }))
  },
})

const navButtonClass =
  'grid size-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 disabled:opacity-40'

function isUnavailable(date: DateValue): boolean {
  const iso = date.toString()
  return isWeekend(iso) || holidayName(iso) !== undefined
}

function cellHint(iso: ISODate): string | undefined {
  return holidayName(iso)
}
</script>

<template>
  <div class="grid gap-6 md:grid-cols-[minmax(0,22rem)_1fr]">
    <div :id="id">
      <CalendarRoot
        v-slot="{ weekDays, grid }"
        v-model="selection"
        role="group"
        multiple
        locale="fr-FR"
        :week-starts-on="1"
        fixed-weeks
        weekday-format="short"
        calendar-label="Choisir les jours de télétravail"
        :min-value="parseDate(today)"
        :is-date-unavailable="isUnavailable"
        :aria-describedby="describedBy"
        :aria-invalid="invalid || undefined"
        class="rounded-lg border bg-white p-1.5 sm:p-3"
        :class="invalid ? 'border-brand-700 ring-1 ring-brand-700' : 'border-ink-200'"
      >
        <CalendarHeader class="flex items-center justify-between pb-2">
          <CalendarPrev :class="navButtonClass" aria-label="Mois précédent">
            <ChevronLeft class="size-5" aria-hidden="true" />
          </CalendarPrev>
          <CalendarHeading class="font-semibold text-ink-900 first-letter:uppercase" />
          <CalendarNext :class="navButtonClass" aria-label="Mois suivant">
            <ChevronRight class="size-5" aria-hidden="true" />
          </CalendarNext>
        </CalendarHeader>
        <CalendarGrid
          v-for="month in grid"
          :key="month.value.toString()"
          class="w-full border-collapse"
        >
          <CalendarGridHead>
            <CalendarGridRow class="grid grid-cols-7">
              <CalendarHeadCell
                v-for="day in weekDays"
                :key="day"
                class="py-1 text-sm font-medium text-ink-600"
              >
                {{ day }}
              </CalendarHeadCell>
            </CalendarGridRow>
          </CalendarGridHead>
          <CalendarGridBody>
            <CalendarGridRow
              v-for="(week, index) in month.rows"
              :key="`week-${index}`"
              class="grid grid-cols-7"
            >
              <CalendarCell
                v-for="date in week"
                :key="date.toString()"
                :date="date"
                class="p-px sm:p-0.5"
              >
                <CalendarCellTrigger
                  :day="date"
                  :month="month.value"
                  :title="cellHint(date.toString())"
                  class="relative grid h-10 w-full min-w-0 place-items-center sm:aspect-square sm:h-auto rounded-lg text-sm text-ink-900 hover:bg-ink-100 data-disabled:text-ink-400 data-disabled:hover:bg-transparent data-outside-view:text-ink-400 data-selected:bg-ink-900 data-selected:font-semibold data-selected:text-white data-selected:hover:bg-ink-700 data-today:font-bold data-today:text-brand-700 data-today:shadow-[inset_0_-3px_0_var(--color-brand-600)] data-selected:data-today:shadow-[inset_0_-3px_0_var(--color-white)] data-selected:data-today:text-white data-unavailable:cursor-not-allowed data-unavailable:text-ink-400 data-unavailable:line-through data-unavailable:hover:bg-transparent"
                />
              </CalendarCell>
            </CalendarGridRow>
          </CalendarGridBody>
        </CalendarGrid>
      </CalendarRoot>
      <p class="mt-2 text-sm text-ink-600">
        Flèches pour se déplacer, Entrée pour choisir. Les jours barrés sont fériés, en week-end ou
        déjà demandés.
      </p>
    </div>

    <SelectedDays v-model="days" />
  </div>
</template>
