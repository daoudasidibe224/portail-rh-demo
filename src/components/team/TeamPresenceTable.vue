<script setup lang="ts">
import { type ISODate } from '@/domain/dates'
import { formatShort } from '@/domain/dateFormat'
import type { PlanningRow } from '@/domain/teamPlanning'
import { fullName } from '@/domain/types'

import { cellStyle } from './cellStyle'

defineProps<{
  rows: readonly PlanningRow[]
  weekDays: readonly ISODate[]
  weekNumber: number
  today: ISODate
  remoteCount: (index: number) => number
}>()
</script>

<template>
  <div class="relative overflow-x-auto">
    <table class="zebra w-full min-w-[40rem] text-sm">
      <caption class="sr-only">
        Présence de l’équipe, semaine
        {{
          weekNumber
        }}, du
        {{
          formatShort(weekDays[0]!)
        }}
        au
        {{
          formatShort(weekDays[4]!)
        }}
      </caption>
      <thead>
        <tr class="border-b border-ink-200 text-left">
          <th scope="col" class="px-4 py-2 font-medium text-ink-600 sm:px-5">Collaborateur</th>
          <th
            v-for="(date, i) in weekDays"
            :key="date"
            scope="col"
            class="px-2 py-2 font-medium text-ink-900"
            :class="date === today ? 'bg-ink-50' : ''"
          >
            <span class="first-letter:uppercase">{{ formatShort(date) }}</span>
            <span class="block text-sm font-normal text-ink-600"
              >{{ remoteCount(i) }} à distance</span
            >
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-ink-200">
        <tr v-for="row in rows" :key="row.member.id">
          <th scope="row" class="px-4 py-1.5 text-left font-medium text-ink-900 sm:px-5">
            {{ fullName(row.member) }}
            <span class="block text-sm font-normal text-ink-600">{{ row.member.jobTitle }}</span>
          </th>
          <td v-for="(cell, i) in row.cells" :key="i" class="px-2 py-1">
            <span
              class="flex items-center gap-1.5 rounded-lg px-2 py-1"
              :class="cellStyle[cell.kind].cls"
            >
              <component
                :is="cellStyle[cell.kind].icon"
                v-if="cellStyle[cell.kind].icon"
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              <span :class="cell.kind === 'office' ? 'sr-only' : ''">{{ cell.label }}</span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
