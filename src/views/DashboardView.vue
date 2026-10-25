<script setup lang="ts">
import { BookOpen, CircleAlert, RotateCcw } from 'lucide-vue-next'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { RouterLink } from 'vue-router'

import WeekPlanner from '@/components/dashboard/WeekPlanner.vue'
import QuickRequestActions from '@/components/request/QuickRequestActions.vue'
import RequestTable from '@/components/request/RequestTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { usePagination } from '@/composables/usePagination'
import { formatLong, yearOf, type ISODate } from '@/domain/dates'
import { formatDays, plural } from '@/domain/format'
import {
  DEFAULT_REQUEST_SORT,
  filterByPeriod,
  isPeriodActive,
  isPeriodInverted,
  REQUEST_SORTS,
  sortRequests,
  type RequestSort,
} from '@/domain/requestFilters'
import { PERIODS, STATUSES } from '@/domain/rules'
import { isOngoing, nextTeleworkDay } from '@/domain/schedule'
import type { RequestStatus } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const heading = usePageHeading()

const next = computed(() => nextTeleworkDay(portal.requests, portal.currentUser.id, portal.today))

type Filter = 'current' | 'all'
const filter = ref<Filter>('current')
const currentRequests = computed(() => portal.myRequests.filter((r) => isOngoing(r, portal.today)))
const REQUESTS_PER_PAGE = 10
const status = ref<RequestStatus | 'all'>('all')
/* Tri et période : seulement dans « Toutes ». Un champ date vide = pas de borne. */
const sort = ref<RequestSort>(DEFAULT_REQUEST_SORT)
const from = ref<ISODate | ''>('')
const to = ref<ISODate | ''>('')
const periodInverted = computed(() => isPeriodInverted(from.value, to.value))
const byStatus = computed(() =>
  status.value === 'all'
    ? portal.myRequests
    : portal.myRequests.filter((r) => r.status === status.value),
)
const listed = computed(() => {
  if (filter.value === 'current') return currentRequests.value
  return sortRequests(filterByPeriod(byStatus.value, from.value, to.value), sort.value)
})
/* Une période inversée compte comme filtre actif, même si elle ne filtre rien. */
const filtersActive = computed(() => status.value !== 'all' || Boolean(from.value || to.value))
const showFilters = computed(
  () =>
    filter.value === 'all' &&
    (portal.myRequests.length > REQUESTS_PER_PAGE ||
      filtersActive.value ||
      sort.value !== DEFAULT_REQUEST_SORT),
)
const resultsLabel = computed(() => {
  if (filter.value !== 'all') return ''
  if (status.value === 'all' && !isPeriodActive(from.value, to.value)) return ''
  const n = listed.value.length
  return `${n} ${plural(n, 'demande')} sur ${portal.myRequests.length}`
})
const periodErrorId = useId()
const statusSelect = ref<HTMLSelectElement | null>(null)
async function resetFilters() {
  status.value = 'all'
  sort.value = DEFAULT_REQUEST_SORT
  from.value = ''
  to.value = ''
  // Le bouton disparaît : le focus passe au premier filtre.
  await nextTick()
  statusSelect.value?.focus()
}
const statusCounts = computed(() => {
  const counts: Record<RequestStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  }
  for (const r of portal.myRequests) counts[r.status] += 1
  return counts
})
watch(filter, (value) => {
  if (value === 'current') status.value = 'all'
})
const pager = usePagination(listed, REQUESTS_PER_PAGE)
watch([filter, status, sort, from, to], () => pager.go(1))
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <PageTitle ref="heading">Mon télétravail</PageTitle>
        <p class="mt-1 text-ink-600 first-letter:uppercase">{{ formatLong(portal.today) }}</p>
        <p>
          <RouterLink
            to="/teletravail/charte"
            class="inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-700 underline underline-offset-2 hover:text-ink-900"
          >
            <BookOpen class="size-4" aria-hidden="true" />
            Lire la charte du télétravail
          </RouterLink>
        </p>
      </div>
      <QuickRequestActions />
    </div>

    <div class="card">
      <WeekPlanner
        :requests="portal.requests"
        :employee-id="portal.currentUser.id"
        :today="portal.today"
      />
    </div>

    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="card px-4 py-3 sm:px-5 sm:py-4">
        <dt class="text-sm text-ink-600">Solde occasionnel {{ yearOf(portal.today) }}</dt>
        <dd class="mt-1 text-ink-900">
          <strong class="text-2xl font-semibold">{{ formatDays(portal.balance.available) }}</strong>
          <span class="text-ink-700"> sur {{ portal.balance.allowance }}</span>
          <span v-if="portal.balance.pending" class="block text-sm text-ink-600"
            >{{ formatDays(portal.balance.pending) }} en attente</span
          >
        </dd>
      </div>
      <div class="card px-4 py-3 sm:px-5 sm:py-4">
        <dt class="text-sm text-ink-600">Prochain jour à distance</dt>
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
                : 'Voir le planning'
            }}
          </RouterLink>
        </dd>
      </div>
    </dl>

    <section aria-labelledby="requests-title">
      <div class="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 id="requests-title" class="text-xl font-semibold text-ink-900">Mes demandes</h2>
        <div class="flex flex-wrap items-center gap-3">
          <label
            v-if="filter === 'all'"
            class="flex items-center gap-2 text-sm font-medium text-ink-900"
          >
            Statut
            <select
              ref="statusSelect"
              v-model="status"
              class="field-select min-h-10 w-auto py-2 text-sm"
            >
              <option value="all">Tous</option>
              <option v-for="(info, key) in STATUSES" :key="key" :value="key">
                {{ info.label }} ({{ statusCounts[key] }})
              </option>
            </select>
          </label>
          <div role="group" aria-label="Filtrer les demandes" class="segmented">
            <button
              v-for="option in [
                { value: 'current', label: `En cours (${currentRequests.length})` },
                { value: 'all', label: `Toutes (${portal.myRequests.length})` },
              ] as const"
              :key="option.value"
              type="button"
              :aria-pressed="filter === option.value"
              class="segmented-item"
              @click="filter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
      <div class="card overflow-hidden">
        <form
          v-if="showFilters"
          role="search"
          aria-label="Filtrer et trier mes demandes"
          class="flex flex-wrap items-start gap-x-4 gap-y-3 border-b border-ink-200 px-4 py-3 sm:px-5"
          @submit.prevent
        >
          <label
            class="flex items-center gap-2 text-sm font-medium text-ink-900 max-sm:grid max-sm:w-full max-sm:grid-cols-[3.5rem_1fr]"
          >
            Trier par
            <select v-model="sort" class="field-select min-h-10 w-auto min-w-0 py-2 text-sm">
              <option v-for="(label, key) in REQUEST_SORTS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </label>
          <fieldset class="flex min-w-0 flex-col gap-3 max-sm:w-full sm:flex-row sm:items-center">
            <legend class="sr-only">Période concernée</legend>
            <label
              class="flex items-center gap-2 text-sm font-medium text-ink-900 max-sm:grid max-sm:grid-cols-[3.5rem_1fr]"
            >
              Du
              <input
                v-model="from"
                type="date"
                :max="to || undefined"
                :aria-invalid="periodInverted || undefined"
                :aria-describedby="periodInverted ? periodErrorId : undefined"
                class="field-input min-h-10 min-w-0 px-3 py-2 text-base sm:w-auto sm:text-sm"
              />
            </label>
            <label
              class="flex items-center gap-2 text-sm font-medium text-ink-900 max-sm:grid max-sm:grid-cols-[3.5rem_1fr]"
            >
              Au
              <input
                v-model="to"
                type="date"
                :min="from || undefined"
                :aria-invalid="periodInverted || undefined"
                :aria-describedby="periodInverted ? periodErrorId : undefined"
                class="field-input min-h-10 min-w-0 px-3 py-2 text-base sm:w-auto sm:text-sm"
              />
            </label>
          </fieldset>
          <AppButton
            v-if="filtersActive || sort !== DEFAULT_REQUEST_SORT"
            variant="ghost"
            size="sm"
            class="max-sm:-ml-3 max-sm:self-start"
            @click="resetFilters"
          >
            <RotateCcw class="size-4" aria-hidden="true" />
            Réinitialiser les filtres
          </AppButton>
          <p
            v-if="periodInverted"
            :id="periodErrorId"
            role="alert"
            class="flex w-full items-start gap-2 text-sm font-medium text-brand-700"
          >
            <CircleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            La date «&nbsp;Au&nbsp;» est avant la date «&nbsp;Du&nbsp;». Corrigez l’une des deux :
            aucun filtre de période n’est appliqué.
          </p>
        </form>
        <p
          v-if="filter === 'all'"
          role="status"
          class="text-sm text-ink-700"
          :class="resultsLabel && 'border-b border-ink-200 px-4 py-2 sm:px-5'"
        >
          {{ resultsLabel }}
        </p>
        <template v-if="listed.length">
          <RequestTable
            :requests="pager.visible.value"
            :caption="filter === 'current' ? 'Mes demandes en cours' : 'Toutes mes demandes'"
          />
          <AppPagination
            :page="pager.page.value"
            :page-count="pager.pageCount.value"
            :from="pager.from.value"
            :to="pager.to.value"
            :total="pager.total.value"
            label="de mes demandes"
            @update:page="pager.go"
          />
        </template>
        <EmptyState
          v-else-if="filter === 'all' && portal.myRequests.length"
          title="Aucune demande ne correspond."
        >
          Modifiez les filtres ou réinitialisez-les pour tout voir.
        </EmptyState>
        <EmptyState
          v-else
          :title="filter === 'current' ? 'Aucune demande en cours.' : 'Aucune demande.'"
        >
          Besoin de télétravailler ?
          <RouterLink to="/demandes/nouvelle" class="link-action">Faire une demande</RouterLink>
        </EmptyState>
      </div>
    </section>
  </div>
</template>
