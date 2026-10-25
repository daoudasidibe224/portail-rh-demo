<script setup lang="ts">
import { type ISODate } from '@/domain/dates'
import { formatShort } from '@/domain/dateFormat'
import type { PlanningRow } from '@/domain/teamPlanning'
import { fullName } from '@/domain/types'

import { cellStyle } from './cellStyle'

defineProps<{
  rows: readonly PlanningRow[]
  total: number
  weekDays: readonly ISODate[]
  weekNumber: number
  today: ISODate
  remoteCount: (index: number) => number
}>()
</script>

<template>
  <div>
    <div
      class="grid grid-cols-[1fr_repeat(5,2.4rem)] items-end gap-x-1 border-b border-ink-200 bg-ink-50 px-4 py-2 text-center text-sm text-ink-600"
      aria-hidden="true"
    >
      <span class="text-left">{{ total }} pers.</span>
      <span
        v-for="(date, i) in weekDays"
        :key="date"
        :class="date === today ? 'font-semibold text-ink-900' : ''"
      >
        {{ formatShort(date).split(' ')[0] }}<br />{{ formatShort(date).split(' ')[1] }}
        <span class="block text-xs">{{ remoteCount(i) }}</span>
      </span>
    </div>
    <ul class="divide-y divide-ink-200" :aria-label="`Présence, semaine ${weekNumber}`">
      <li
        v-for="row in rows"
        :key="row.member.id"
        class="grid grid-cols-[1fr_repeat(5,2.4rem)] items-center gap-x-1 px-4 py-2"
      >
        <p class="min-w-0 text-sm font-medium text-ink-900">
          {{ fullName(row.member) }}
          <span class="block truncate font-normal text-ink-600">{{ row.member.jobTitle }}</span>
        </p>
        <span
          v-for="(cell, i) in row.cells"
          :key="i"
          class="grid h-10 place-items-center rounded-lg"
          :class="cellStyle[cell.kind].cls"
        >
          <component
            :is="cellStyle[cell.kind].icon"
            v-if="cellStyle[cell.kind].icon"
            class="size-4"
            aria-hidden="true"
          />
          <span v-else aria-hidden="true">·</span>
          <span class="sr-only">{{ formatShort(weekDays[i]!) }} : {{ cell.label }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>
