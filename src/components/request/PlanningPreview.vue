<script setup lang="ts">
import { computed } from 'vue'

import { formatDayMonth } from '@/domain/dateFormat'
import { PLANNING_MAX_WEEKS, planningFor, type PlanningKind } from '@/domain/planningWeeks'
import type { DayPeriod, RequestDraft, TeleworkRequest } from '@/domain/types'

const props = defineProps<{
  draft: RequestDraft
  requests: readonly TeleworkRequest[]
  employeeId: string
}>()

const WEEKDAY_LABELS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.']

const CELL: Record<PlanningKind, { label: string; cls: string }> = {
  office: { label: 'Sur site', cls: 'bg-white text-ink-600' },
  draft: { label: 'Demandé', cls: 'bg-info-50 font-semibold text-info-700' },
  remote: { label: 'Télétravail', cls: 'bg-success-50 font-semibold text-success-700' },
  pending: { label: 'En attente', cls: 'bg-warning-50 font-semibold text-warning-700' },
  holiday: { label: 'Férié', cls: 'bg-ink-100 text-ink-600' },
}

const PERIOD_LABEL: Record<DayPeriod, string> = { day: '', am: ' (matin)', pm: ' (après-midi)' }

const planning = computed(() => planningFor(props.draft, props.requests, props.employeeId))
const weeks = computed(() =>
  planning.value.weeks.map((week) => ({
    ...week,
    days: week.days.map((day) => ({
      date: day.date,
      text: `${CELL[day.kind].label}${PERIOD_LABEL[day.period]}`,
      cls: CELL[day.kind].cls,
    })),
  })),
)
const truncated = computed(() => planning.value.truncated)
</script>

<template>
  <div v-if="weeks.length">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-xs sm:text-sm">
        <caption class="sr-only">
          Planning prévisionnel par semaine
        </caption>
        <thead>
          <tr>
            <th scope="col" class="p-1 text-left font-medium text-ink-600">Semaine</th>
            <th
              v-for="label in WEEKDAY_LABELS"
              :key="label"
              scope="col"
              class="p-1 font-medium text-ink-600"
            >
              {{ label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="week in weeks" :key="week.monday">
            <th
              scope="row"
              class="p-1 text-left align-top font-medium whitespace-nowrap text-ink-900"
            >
              S{{ week.number }}
              <span class="block font-normal text-ink-600">{{ formatDayMonth(week.monday) }}</span>
            </th>
            <td
              v-for="day in week.days"
              :key="day.date"
              class="border border-ink-200 p-1 text-center"
              :class="day.cls"
            >
              <span class="sr-only">{{ formatDayMonth(day.date) }} : </span>{{ day.text }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="truncated" class="mt-2 text-sm text-ink-600">
      Aperçu limité aux {{ PLANNING_MAX_WEEKS }} premières semaines.
    </p>
  </div>
  <p v-else class="text-sm text-ink-600">
    Le planning s’affiche dès que vous avez choisi une date.
  </p>
</template>
