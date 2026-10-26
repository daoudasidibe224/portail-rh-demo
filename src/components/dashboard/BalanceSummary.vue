<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { yearOf } from '@/lib/dates'
import { formatLong } from '@/lib/dateFormat'
import { formatDays, formatHours, plural } from '@/lib/format'
import { PERIODS } from '@/lib/rules'
import { nextTeleworkDay } from '@/lib/schedule'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const next = computed(() => nextTeleworkDay(portal.requests, portal.currentUser.id, portal.today))
</script>

<template>
  <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
    <div class="card px-4 py-3 sm:px-5 sm:py-4">
      <dt class="text-sm text-ink-600">Solde occasionnel disponible {{ yearOf(portal.today) }}</dt>
      <dd class="mt-1 text-ink-900">
        <strong class="text-2xl font-semibold">{{ formatDays(portal.balance.available) }}</strong>
        <span class="text-ink-700"> sur {{ portal.balance.allowance }}</span>
        <span class="block text-sm text-ink-600"
          >soit {{ formatHours(portal.balance.available) }} sur
          {{ formatHours(portal.balance.allowance) }}</span
        >
        <span v-if="portal.balance.pending" class="block text-sm text-ink-600"
          >{{ formatDays(portal.balance.pending) }} en attente</span
        >
      </dd>
    </div>
    <div class="card px-4 py-3 sm:px-5 sm:py-4">
      <dt class="text-sm text-ink-600">Prochain jour de télétravail</dt>
      <dd class="mt-1 text-ink-900 first-letter:uppercase">
        <template v-if="next">
          <strong class="text-2xl font-semibold">{{ formatLong(next.date) }}</strong>
          <span class="block text-sm text-ink-600 first-letter:lowercase">
            {{ next.period === 'day' ? '' : `${PERIODS[next.period].short}, `
            }}{{ next.request.status === 'pending' ? 'en attente' : 'validé' }}
          </span>
        </template>
        <span v-else class="text-ink-700">Aucun dans les deux prochains mois</span>
      </dd>
    </div>
    <div v-if="portal.teamMembers.length" class="card col-span-2 px-5 py-4 sm:col-span-1">
      <dt class="text-sm text-ink-600">Mon équipe</dt>
      <dd class="mt-1">
        <RouterLink to="/equipe" class="link-action inline-flex min-h-10 items-center text-lg">
          {{
            portal.teamPending.length
              ? `${portal.teamPending.length} ${plural(portal.teamPending.length, 'demande')} à valider`
              : 'Voir mon équipe'
          }}
        </RouterLink>
      </dd>
    </div>
  </dl>
</template>
