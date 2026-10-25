<script setup lang="ts">
import { Building2, CalendarOff, House } from 'lucide-vue-next'
import { computed } from 'vue'

import StatusBadge from '@/components/ui/StatusBadge.vue'
import { addDays, type ISODate } from '@/domain/dates'
import { holidayName } from '@/domain/holidays'
import { isBusinessDay } from '@/domain/businessDays'
import { formatLong } from '@/domain/dateFormat'
import { PERIODS } from '@/domain/rules'
import { entryFor, nextTeleworkDay } from '@/domain/schedule'
import type { DayPeriod, TeleworkRequest } from '@/domain/types'

const props = defineProps<{
  requests: readonly TeleworkRequest[]
  employeeId: string
  today: ISODate
}>()

const TODAY_LABELS: Record<DayPeriod, string> = {
  day: 'En télétravail toute la journée',
  am: 'En télétravail le matin, au bureau l’après-midi',
  pm: 'Au bureau le matin, en télétravail l’après-midi',
}

const todayEntry = computed(() => entryFor(props.requests, props.employeeId, props.today))
const offDay = computed(() => {
  if (isBusinessDay(props.today)) return null
  const holiday = holidayName(props.today)
  return holiday ? `Jour férié : ${holiday}` : 'Week-end'
})
// Demain, pas aujourd'hui : le jour en cours est déjà affiché à côté.
const next = computed(() =>
  nextTeleworkDay(props.requests, props.employeeId, addDays(props.today, 1)),
)
</script>

<template>
  <dl class="grid divide-ink-200 max-sm:divide-y sm:grid-cols-2 sm:divide-x">
    <div class="px-4 py-4 sm:px-5">
      <dt class="text-sm text-ink-600">Aujourd’hui</dt>
      <dd class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-900">
        <template v-if="offDay">
          <span class="flex items-center gap-2 font-semibold">
            <CalendarOff class="size-5 shrink-0 text-ink-600" aria-hidden="true" />
            {{ offDay }}
          </span>
        </template>
        <template v-else-if="todayEntry">
          <span class="flex items-center gap-2 font-semibold">
            <House class="size-5 shrink-0 text-ink-600" aria-hidden="true" />
            {{ TODAY_LABELS[todayEntry.period] }}
          </span>
          <StatusBadge :status="todayEntry.request.status" />
        </template>
        <span v-else class="flex items-center gap-2 font-semibold">
          <Building2 class="size-5 shrink-0 text-ink-600" aria-hidden="true" />
          Au bureau
        </span>
      </dd>
    </div>
    <div class="px-4 py-4 sm:px-5">
      <dt class="text-sm text-ink-600">Prochain jour à distance</dt>
      <dd class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-900">
        <template v-if="next">
          <span class="font-semibold first-letter:uppercase">
            {{ formatLong(next.date) }}
            <span v-if="next.period !== 'day'" class="font-normal text-ink-600"
              >({{ PERIODS[next.period].short }})</span
            >
          </span>
          <StatusBadge :status="next.request.status" />
        </template>
        <template v-else>Aucun dans les deux prochains mois</template>
      </dd>
    </div>
  </dl>
</template>
