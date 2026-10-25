<script setup lang="ts">
import { type ISODate } from '@/domain/dates'
import { formatDateTime, formatFull } from '@/domain/dateFormat'
import { RULES } from '@/domain/rules'
import { fullName, type TeleworkRequest } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

defineProps<{
  request: TeleworkRequest
  isMine: boolean
  managerName: string | null
  responseDeadline: ISODate | ''
}>()

const portal = usePortalStore()

const actionLabels = {
  submitted: 'Demande envoyée',
  approved: 'Demande validée',
  rejected: 'Demande refusée',
  cancelled: 'Demande annulée',
} as const
</script>

<template>
  <section aria-labelledby="history-title" class="card mt-6 p-5 sm:p-6">
    <h2 id="history-title" class="text-lg font-semibold text-ink-900">Suivi</h2>
    <ol class="mt-4 space-y-4 border-l-2 border-ink-200 pl-5">
      <li v-for="(event, i) in request.history" :key="i" class="relative">
        <span
          class="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-ink-700"
          aria-hidden="true"
        />
        <p class="font-medium text-ink-900">{{ actionLabels[event.action] }}</p>
        <p class="text-sm text-ink-600">
          {{ formatDateTime(event.at) }}, par
          {{
            portal.employeeById(event.actorId)
              ? fullName(portal.employeeById(event.actorId)!)
              : 'le système'
          }}
        </p>
        <p
          v-if="event.comment"
          class="mt-1 rounded-lg bg-ink-50 px-3 py-2 text-sm break-words text-ink-900"
        >
          « {{ event.comment }} »
        </p>
      </li>
      <li v-if="request.status === 'pending'" class="relative">
        <span
          class="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full border-2 border-ink-400 bg-white"
          aria-hidden="true"
        />
        <p class="font-medium text-ink-700">
          En attente de
          {{ isMine ? (managerName ?? 'votre manager') : 'votre décision' }}
        </p>
        <p class="text-sm text-ink-600">
          Réponse attendue sous {{ RULES.responseBusinessDays }} jours ouvrés, soit avant le
          {{ formatFull(responseDeadline) }}.
        </p>
      </li>
    </ol>
  </section>
</template>
