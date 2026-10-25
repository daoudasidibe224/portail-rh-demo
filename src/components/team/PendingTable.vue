<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useMediaQuery } from '@/composables/useMediaQuery'
import { describeQuantity, describeSchedule, describeType } from '@/domain/format'
import type { TeleworkRequest } from '@/domain/types'

import RemoteCount from './RemoteCount.vue'
import RequestActions from './RequestActions.vue'
import RequestFlags from './RequestFlags.vue'

const props = defineProps<{
  requests: readonly TeleworkRequest[]
  selected: ReadonlySet<string>
  nameOf: (request: TeleworkRequest) => string
  /** Collègues déjà à distance le premier jour demandé, et taille de l'équipe concernée. */
  remote: (request: TeleworkRequest) => { count: number; total: number } | null
}>()

const emit = defineEmits<{
  toggle: [id: string]
  'toggle-page': [checked: boolean]
  approve: [request: TeleworkRequest]
  reject: [request: TeleworkRequest]
}>()

// Téléphone : une carte par demande plutôt qu'un tableau qui défile.
const wide = useMediaQuery('(min-width: 48rem)')

const pageSelected = computed(
  () => props.requests.length > 0 && props.requests.every((r) => props.selected.has(r.id)),
)
const pageSomeSelected = computed(
  () => !pageSelected.value && props.requests.some((r) => props.selected.has(r.id)),
)
</script>

<template>
  <div v-if="wide" class="relative overflow-x-auto">
    <table class="zebra w-full min-w-[48rem] text-left text-sm">
      <caption class="sr-only">
        Demandes à valider
      </caption>
      <thead>
        <tr class="border-b border-ink-200 bg-ink-50 text-ink-600">
          <th scope="col" class="w-12 py-1 pl-4 sm:pl-5">
            <label class="grid size-10 cursor-pointer place-items-center">
              <input
                type="checkbox"
                class="check"
                :checked="pageSelected"
                :indeterminate.prop="pageSomeSelected"
                @change="emit('toggle-page', ($event.target as HTMLInputElement).checked)"
              />
              <span class="sr-only">Sélectionner toutes les demandes de cette page</span>
            </label>
          </th>
          <th scope="col" class="px-3 py-2.5 font-medium">Collaborateur</th>
          <th scope="col" class="px-3 py-2.5 font-medium">Dates</th>
          <th scope="col" class="px-3 py-2.5 font-medium">Durée</th>
          <th scope="col" class="px-3 py-2.5 font-medium">Équipe ce jour-là</th>
          <th scope="col" class="px-4 py-2.5 sm:px-5"><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-ink-200">
        <tr
          v-for="request in requests"
          :key="request.id"
          class="align-top"
          :data-selected="selected.has(request.id)"
        >
          <td class="py-1 pl-4 sm:pl-5">
            <label class="grid size-10 cursor-pointer place-items-center">
              <input
                type="checkbox"
                class="check"
                :checked="selected.has(request.id)"
                @change="emit('toggle', request.id)"
              />
              <span class="sr-only">Sélectionner la demande de {{ nameOf(request) }}</span>
            </label>
          </td>
          <th scope="row" class="px-3 py-2 font-normal">
            <RouterLink
              :to="`/demandes/${request.id}`"
              class="link-quiet -my-2.5 inline-block py-2.5 font-semibold text-ink-900"
            >
              {{ nameOf(request) }}
            </RouterLink>
            <span class="flex flex-wrap items-center gap-x-2 text-ink-700">
              {{ describeType(request) }}
              <RequestFlags :request="request" />
            </span>
          </th>
          <td class="px-3 py-2 text-ink-900 first-letter:uppercase">
            {{ describeSchedule(request) }}
          </td>
          <td class="px-3 py-2 whitespace-nowrap text-ink-700">{{ describeQuantity(request) }}</td>
          <td class="px-3 py-2 whitespace-nowrap text-ink-700">
            <RemoteCount
              v-if="remote(request)"
              :count="remote(request)!.count"
              :total="remote(request)!.total"
            />
            <span v-else class="text-ink-600">Date à préciser</span>
          </td>
          <td class="px-4 py-1.5 sm:px-5">
            <div class="flex justify-end gap-2">
              <RequestActions
                size="sm"
                :name="nameOf(request)"
                @approve="emit('approve', request)"
                @reject="emit('reject', request)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-else>
    <label
      class="flex min-h-12 cursor-pointer items-center gap-3 border-b border-ink-200 bg-ink-50 px-4 text-sm font-medium text-ink-700"
    >
      <input
        type="checkbox"
        class="check"
        :checked="pageSelected"
        :indeterminate.prop="pageSomeSelected"
        @change="emit('toggle-page', ($event.target as HTMLInputElement).checked)"
      />
      Sélectionner toutes les demandes de cette page
    </label>
    <ul class="divide-y divide-ink-200" aria-label="Demandes à valider">
      <li
        v-for="request in requests"
        :key="request.id"
        class="px-4 py-3"
        :class="selected.has(request.id) ? 'bg-ink-50' : ''"
      >
        <div class="flex items-start gap-3">
          <label class="-m-2.5 grid size-10 shrink-0 cursor-pointer place-items-center">
            <input
              type="checkbox"
              class="check"
              :checked="selected.has(request.id)"
              @change="emit('toggle', request.id)"
            />
            <span class="sr-only">Sélectionner la demande de {{ nameOf(request) }}</span>
          </label>
          <div class="min-w-0 flex-1">
            <RouterLink
              :to="`/demandes/${request.id}`"
              class="link-quiet -my-2.5 inline-block py-2.5 font-semibold text-ink-900"
            >
              {{ nameOf(request) }}
            </RouterLink>
            <p class="text-sm text-ink-700">{{ describeType(request) }}</p>
            <p class="mt-0.5 text-sm text-ink-900 first-letter:uppercase">
              {{ describeSchedule(request) }} · {{ describeQuantity(request) }}
            </p>
            <p v-if="remote(request)" class="mt-0.5 flex text-sm text-ink-700">
              <RemoteCount :count="remote(request)!.count" :total="remote(request)!.total" />
            </p>
            <p
              v-if="request.comment || request.attachment"
              class="mt-0.5 flex flex-wrap gap-x-3 text-sm text-ink-600"
            >
              <RequestFlags :request="request" />
            </p>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2 pl-8">
          <RequestActions
            :name="nameOf(request)"
            @approve="emit('approve', request)"
            @reject="emit('reject', request)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>
