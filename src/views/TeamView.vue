<script setup lang="ts">
import { Building2, Download, Hourglass, Laptop, Printer } from 'lucide-vue-next'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed, nextTick, ref, watch } from 'vue'

import PendingTable from '@/components/team/PendingTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import WeekNav from '@/components/ui/WeekNav.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { usePageHeading } from '@/composables/usePageHeading'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import { addDays, formatShort, holidayName, isoWeekNumber, startOfWeek } from '@/domain/dates'
import { searchDirectory } from '@/domain/directory'
import { downloadText, planningCsv } from '@/domain/export'
import { plural } from '@/domain/format'
import { PERIODS, REQUEST_TYPES } from '@/domain/rules'
import { entryFor, firstDate } from '@/domain/schedule'
import {
  groupByEmployee,
  teammatesRemoteOn,
  TRIAGE_SORTS,
  triagePending,
  type TriageFilters,
} from '@/domain/triage'
import { fullName, type TeleworkRequest } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const { show } = useToast()
const heading = usePageHeading()

const author = (r: TeleworkRequest) => portal.employeeById(r.employeeId)
const authorName = (r: TeleworkRequest) => {
  const e = author(r)
  return e ? fullName(e) : 'Collaborateur inconnu'
}

/* Valider ou refuser retire la demande de la liste, donc le bouton qui avait le focus :
   il passe à l'onglet « À valider ». */
const pendingTab = ref<{ $el: HTMLElement } | null>(null)
async function focusPending(afterDialog = false) {
  await nextTick()
  if (afterDialog) {
    // Le dialogue rend d'abord le focus à son déclencheur, qui n'existe plus.
    setTimeout(() => pendingTab.value?.$el.focus(), 0)
  } else {
    pendingTab.value?.$el.focus()
  }
}

function approve(request: TeleworkRequest) {
  portal.approve(request.id)
  show(`Demande de ${authorName(request)} validée`)
  void focusPending()
}

const rejecting = ref<TeleworkRequest | null>(null)
const rejectOpen = computed({
  get: () => rejecting.value !== null,
  set: (open) => {
    if (!open) rejecting.value = null
  },
})
function reject(comment: string) {
  if (!rejecting.value) return
  const request = rejecting.value
  portal.reject(request.id, comment)
  show(`Demande de ${authorName(request)} refusée`, { tone: 'info' })
  void focusPending(true)
}

const weekOffset = ref(0)
const monday = computed(() => addDays(startOfWeek(portal.today), weekOffset.value * 7))
const weekDays = computed(() => [0, 1, 2, 3, 4].map((i) => addDays(monday.value, i)))
const MEMBERS_PER_PAGE = 15
const PENDING_PER_PAGE = 10
/* Sous 48 rem, le planning devient une liste : une ligne par personne, cinq pastilles. */
const wide = useMediaQuery('(min-width: 48rem)')
const tab = ref(portal.teamPending.length ? 'pending' : 'presence')
const memberQuery = ref('')
const teamFilter = ref('all')
const teams = computed(() =>
  [...new Set(portal.teamMembers.map((m) => m.team))].sort((a, b) => a.localeCompare(b, 'fr')),
)
const allRows = computed(() =>
  portal.teamMembers.map((member) => ({
    member,
    cells: weekDays.value.map((date) => {
      const holiday = holidayName(date)
      const entry = entryFor(portal.requests, member.id, date)
      if (holiday) return { kind: 'holiday' as const, label: 'Férié' }
      if (!entry) return { kind: 'office' as const, label: 'Sur site' }
      const period = entry.period === 'day' ? '' : ` ${PERIODS[entry.period].short}`
      return entry.request.status === 'pending'
        ? { kind: 'pending' as const, label: `À valider${period}` }
        : { kind: 'remote' as const, label: `Télétravail${period}` }
    }),
  })),
)
const remoteCount = (index: number) =>
  allRows.value.filter((r) => r.cells[index]?.kind === 'remote').length

const filteredRows = computed(() => {
  const found = new Set(searchDirectory(portal.teamMembers, memberQuery.value).map((m) => m.id))
  return allRows.value.filter(
    (r) =>
      found.has(r.member.id) && (teamFilter.value === 'all' || r.member.team === teamFilter.value),
  )
})
/* Export : toute la sélection filtrée, pas seulement la page affichée. */
function exportPlanning() {
  const days = weekDays.value.map((d) => formatShort(d))
  const csv = planningCsv(
    days,
    filteredRows.value.map((r) => ({
      name: fullName(r.member),
      jobTitle: r.member.jobTitle,
      team: r.member.team,
      cells: r.cells.map((c) => c.label),
    })),
  )
  downloadText(`presence-equipe-semaine-${isoWeekNumber(monday.value)}.csv`, csv)
  show('Planning exporté', {
    description: `${filteredRows.value.length} ${plural(filteredRows.value.length, 'collaborateur')}, semaine ${isoWeekNumber(monday.value)}.`,
    tone: 'info',
  })
}
const printPlanning = () => window.print()
const memberPager = usePagination(filteredRows, MEMBERS_PER_PAGE)
watch([memberQuery, teamFilter], () => memberPager.go(1))
const rows = memberPager.visible

/* Index par collaborateur, pour ne pas parcourir toutes les demandes à chaque case. */
const byEmployee = computed(() => groupByEmployee(portal.requests))

const filters = ref<TriageFilters>({ query: '', type: 'all', sort: 'start' })
const pendingList = computed(() =>
  triagePending(portal.teamPending, authorName, filters.value, (r) => {
    const e = author(r)
    return e ? `${e.lastName} ${e.firstName}` : ''
  }),
)
const pendingPager = usePagination(pendingList, PENDING_PER_PAGE)
const selected = ref<Set<string>>(new Set())
watch(
  filters,
  () => {
    selected.value = new Set()
    pendingPager.go(1)
  },
  { deep: true },
)
/* Une demande traitée par ailleurs ne reste pas sélectionnée. */
watch(pendingList, (list) => {
  const ids = new Set(list.map((r) => r.id))
  selected.value = new Set([...selected.value].filter((id) => ids.has(id)))
})
const memberIds = computed(() => portal.teamMembers.map((m) => m.id))
function remoteFor(request: TeleworkRequest) {
  const date = firstDate(request)
  if (!date) return null
  return {
    count: teammatesRemoteOn(byEmployee.value, memberIds.value, date, request.employeeId),
    total: Math.max(0, memberIds.value.length - 1),
  }
}
function toggleOne(id: string) {
  const next = new Set(selected.value)
  if (!next.delete(id)) next.add(id)
  selected.value = next
}
function togglePage(checked: boolean) {
  const next = new Set(selected.value)
  for (const r of pendingPager.visible.value) {
    if (checked) next.add(r.id)
    else next.delete(r.id)
  }
  selected.value = next
}
const pageFullySelected = computed(
  () =>
    pendingPager.visible.value.length > 0 &&
    pendingPager.visible.value.every((r) => selected.value.has(r.id)),
)
const canSelectAll = computed(
  () => pageFullySelected.value && pendingList.value.length > selected.value.size,
)
function selectAll() {
  selected.value = new Set(pendingList.value.map((r) => r.id))
}
const bulkOpen = ref(false)
const bulkRequests = computed(() => pendingList.value.filter((r) => selected.value.has(r.id)))
const bulkDescription = computed(() => {
  const names = bulkRequests.value.map(authorName)
  const shown = names.slice(0, 5).join(', ')
  return names.length > 5 ? `${shown} et ${names.length - 5} autres.` : `${shown}.`
})
function approveSelected() {
  const requests = bulkRequests.value
  for (const request of requests) portal.approve(request.id)
  selected.value = new Set()
  show(
    `${requests.length} ${plural(requests.length, 'demande')} ${plural(requests.length, 'validée')}`,
  )
  void focusPending()
}
const resultsLabel = computed(() =>
  pendingList.value.length === portal.teamPending.length
    ? ''
    : `${pendingList.value.length} sur ${portal.teamPending.length} ${plural(portal.teamPending.length, 'demande')}`,
)

const cellStyle = {
  office: { icon: Building2, cls: 'text-ink-600' },
  remote: { icon: Laptop, cls: 'bg-success-50 text-success-700' },
  pending: { icon: Hourglass, cls: 'bg-warning-50 text-warning-700' },
  holiday: { icon: null, cls: 'bg-ink-100 text-ink-600' },
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <PageTitle ref="heading">Mon équipe</PageTitle>
      <p class="mt-1 text-ink-700">
        {{ portal.teamMembers.length }} {{ plural(portal.teamMembers.length, 'collaborateur') }},
        {{ portal.teamPending.length }} {{ plural(portal.teamPending.length, 'demande') }} à valider
      </p>
    </div>

    <TabsRoot v-model="tab" class="card overflow-hidden">
      <div class="border-b border-ink-200 px-4 py-3 sm:px-5 print:hidden">
        <TabsList aria-label="Vues de l’équipe" class="segmented max-sm:flex max-sm:w-full">
          <TabsTrigger
            ref="pendingTab"
            value="pending"
            class="segmented-item max-sm:flex-1 max-sm:justify-center max-sm:px-2"
          >
            À valider
            <span class="rounded-md bg-white px-1.5 text-sm font-semibold text-ink-900">
              {{ portal.teamPending.length }}
            </span>
          </TabsTrigger>
          <TabsTrigger
            aria-label="Présence de l’équipe"
            value="presence"
            class="segmented-item max-sm:flex-1 max-sm:justify-center max-sm:px-2"
          >
            Présence<span class="max-sm:hidden"> de l’équipe</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="pending" class="focus-visible:outline-none">
        <EmptyState v-if="!portal.teamPending.length" title="Tout est traité.">
          Les nouvelles demandes apparaîtront ici.
        </EmptyState>
        <template v-else>
          <form
            v-if="
              portal.teamPending.length > PENDING_PER_PAGE ||
              filters.query ||
              filters.type !== 'all'
            "
            role="search"
            aria-label="Filtrer les demandes à valider"
            class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink-200 px-4 py-3 sm:px-5"
            @submit.prevent
          >
            <SearchInput
              v-model="filters.query"
              label="Rechercher un collaborateur"
              class="flex-1 basis-56"
            />
            <label
              class="flex items-center gap-2 text-sm font-medium text-ink-900 max-sm:w-full max-sm:justify-between"
            >
              Type
              <select v-model="filters.type" class="field-select w-auto py-2 text-sm">
                <option value="all">Tous</option>
                <option v-for="(info, key) in REQUEST_TYPES" :key="key" :value="key">
                  {{ info.label }}
                </option>
              </select>
            </label>
            <label
              class="flex items-center gap-2 text-sm font-medium text-ink-900 max-sm:w-full max-sm:justify-between"
            >
              Trier par
              <select v-model="filters.sort" class="field-select w-auto py-2 text-sm">
                <option v-for="(label, key) in TRIAGE_SORTS" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </label>
          </form>
          <p
            v-if="resultsLabel"
            class="border-b border-ink-200 px-4 py-2 text-sm text-ink-700 sm:px-5"
            role="status"
          >
            {{ resultsLabel }}
          </p>

          <div
            v-if="selected.size"
            class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-200 bg-ink-50 px-4 py-2 sm:px-5"
          >
            <p class="text-sm font-semibold text-ink-900" role="status">
              {{ selected.size }} {{ plural(selected.size, 'demande') }}
              {{ plural(selected.size, 'sélectionnée') }}
            </p>
            <AppButton variant="solid" size="sm" @click="bulkOpen = true">
              Valider la sélection
            </AppButton>
            <AppButton variant="ghost" size="sm" @click="selected = new Set()">
              Tout désélectionner
            </AppButton>
            <button
              v-if="canSelectAll"
              type="button"
              class="link-action -my-2 inline-block py-2 text-sm"
              @click="selectAll"
            >
              Sélectionner les {{ pendingList.length }} demandes
            </button>
          </div>

          <template v-if="pendingList.length">
            <PendingTable
              :requests="pendingPager.visible.value"
              :selected="selected"
              :name-of="authorName"
              :remote="remoteFor"
              @toggle="toggleOne"
              @toggle-page="togglePage"
              @approve="approve"
              @reject="rejecting = $event"
            />
            <AppPagination
              :page="pendingPager.page.value"
              :page-count="pendingPager.pageCount.value"
              :from="pendingPager.from.value"
              :to="pendingPager.to.value"
              :total="pendingPager.total.value"
              label="des demandes à valider"
              @update:page="pendingPager.go"
            />
          </template>
          <EmptyState v-else title="Aucune demande ne correspond.">
            Modifiez la recherche ou le type pour les retrouver.
          </EmptyState>
        </template>
      </TabsContent>

      <TabsContent value="presence" class="focus-visible:outline-none">
        <h2 class="hidden px-5 pt-4 text-lg font-semibold text-ink-900 print:block">
          Présence de l’équipe, semaine {{ isoWeekNumber(monday) }}
        </h2>
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-200 px-4 py-3 sm:px-5 print:hidden"
        >
          <template v-if="portal.teamMembers.length > MEMBERS_PER_PAGE || teams.length > 1">
            <SearchInput
              v-if="portal.teamMembers.length > MEMBERS_PER_PAGE"
              v-model="memberQuery"
              label="Filtrer par nom ou poste"
              class="flex-1 basis-56"
            />
            <label
              v-if="teams.length > 1"
              class="flex items-center gap-2 text-sm font-medium text-ink-900"
            >
              Équipe
              <select v-model="teamFilter" class="field-select w-auto py-2 text-sm">
                <option value="all">Toutes</option>
                <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
              </select>
            </label>
            <p class="text-sm text-ink-700" role="status">
              {{ filteredRows.length }} {{ plural(filteredRows.length, 'collaborateur') }}
            </p>
          </template>
          <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-700" aria-label="Légende">
            <li class="flex items-center gap-1.5">
              <Building2 class="size-4" aria-hidden="true" /> Sur site
            </li>
            <li class="flex items-center gap-1.5 text-success-700">
              <Laptop class="size-4" aria-hidden="true" /> Télétravail
            </li>
            <li class="flex items-center gap-1.5 text-warning-700">
              <Hourglass class="size-4" aria-hidden="true" /> À valider
            </li>
          </ul>
          <WeekNav
            :label="`Semaine ${isoWeekNumber(monday)}`"
            class="max-sm:w-full max-sm:justify-between sm:ml-auto"
            @previous="weekOffset--"
            @next="weekOffset++"
          />
        </div>
        <div v-if="wide" class="relative overflow-x-auto">
          <table class="zebra w-full min-w-[40rem] text-sm">
            <caption class="sr-only">
              Présence de l’équipe, semaine
              {{
                isoWeekNumber(monday)
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
                <th scope="col" class="px-4 py-2 font-medium text-ink-600 sm:px-5">
                  Collaborateur
                </th>
                <th
                  v-for="(date, i) in weekDays"
                  :key="date"
                  scope="col"
                  class="px-2 py-2 font-medium text-ink-900"
                  :class="date === portal.today ? 'bg-ink-50' : ''"
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
                  <span class="block text-sm font-normal text-ink-600">{{
                    row.member.jobTitle
                  }}</span>
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
        <div v-else>
          <div
            class="grid grid-cols-[1fr_repeat(5,2.4rem)] items-end gap-x-1 border-b border-ink-200 bg-ink-50 px-4 py-2 text-center text-sm text-ink-600"
            aria-hidden="true"
          >
            <span class="text-left">{{ filteredRows.length }} pers.</span>
            <span
              v-for="(date, i) in weekDays"
              :key="date"
              :class="date === portal.today ? 'font-semibold text-ink-900' : ''"
            >
              {{ formatShort(date).split(' ')[0] }}<br />{{ formatShort(date).split(' ')[1] }}
              <span class="block text-xs">{{ remoteCount(i) }}</span>
            </span>
          </div>
          <ul
            class="divide-y divide-ink-200"
            :aria-label="`Présence, semaine ${isoWeekNumber(monday)}`"
          >
            <li
              v-for="row in rows"
              :key="row.member.id"
              class="grid grid-cols-[1fr_repeat(5,2.4rem)] items-center gap-x-1 px-4 py-2"
            >
              <p class="min-w-0 text-sm font-medium text-ink-900">
                {{ fullName(row.member) }}
                <span class="block truncate font-normal text-ink-600">{{
                  row.member.jobTitle
                }}</span>
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
        <div
          class="flex flex-wrap items-center gap-2 border-t border-ink-200 px-4 py-2 sm:px-5 print:hidden"
        >
          <span class="mr-1 text-sm text-ink-700">Cette semaine :</span>
          <AppButton
            variant="ghost"
            size="sm"
            :disabled="!filteredRows.length"
            @click="exportPlanning"
          >
            <Download class="size-4" aria-hidden="true" /> Exporter en CSV
          </AppButton>
          <AppButton variant="ghost" size="sm" @click="printPlanning">
            <Printer class="size-4" aria-hidden="true" /> Imprimer
          </AppButton>
        </div>
        <p v-if="!filteredRows.length" class="px-5 py-6 text-ink-700">
          Aucun collaborateur ne correspond à cette recherche.
        </p>
        <AppPagination
          :page="memberPager.page.value"
          :page-count="memberPager.pageCount.value"
          :from="memberPager.from.value"
          :to="memberPager.to.value"
          :total="memberPager.total.value"
          label="du planning"
          @update:page="memberPager.go"
        />
      </TabsContent>
    </TabsRoot>

    <ConfirmDialog
      v-model:open="bulkOpen"
      :title="`Valider ${bulkRequests.length} ${plural(bulkRequests.length, 'demande')} ?`"
      :description="`${bulkDescription} Les collaborateurs seront prévenus. Un refus se fait toujours demande par demande, avec un motif.`"
      :confirm-label="`Valider ${bulkRequests.length} ${plural(bulkRequests.length, 'demande')}`"
      @confirm="approveSelected"
    />

    <ConfirmDialog
      v-model:open="rejectOpen"
      :title="`Refuser la demande de ${rejecting ? authorName(rejecting) : ''} ?`"
      description="Expliquez votre décision : le motif sera visible par le collaborateur."
      confirm-label="Refuser"
      tone="danger"
      comment-label="Motif du refus"
      comment-required
      @confirm="reject"
    />
  </div>
</template>
