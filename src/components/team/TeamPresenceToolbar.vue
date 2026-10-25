<script setup lang="ts">
import { Building2, Hourglass, Laptop } from 'lucide-vue-next'

import SearchInput from '@/components/ui/SearchInput.vue'
import WeekNav from '@/components/ui/WeekNav.vue'
import { plural } from '@/domain/format'

const query = defineModel<string>('query', { required: true })
const team = defineModel<string>('team', { required: true })

defineProps<{
  showSearch: boolean
  teams: readonly string[]
  count: number
  weekNumber: number
  showFilters: boolean
}>()
defineEmits<{ previous: []; next: [] }>()
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-200 px-4 py-3 sm:px-5 print:hidden"
  >
    <template v-if="showFilters">
      <SearchInput
        v-if="showSearch"
        v-model="query"
        label="Filtrer par nom ou poste"
        class="flex-1 basis-56"
      />
      <label
        v-if="teams.length > 1"
        class="flex items-center gap-2 text-sm font-medium text-ink-900"
      >
        Équipe
        <select v-model="team" class="field-select w-auto py-2 text-sm">
          <option value="all">Toutes</option>
          <option v-for="name in teams" :key="name" :value="name">{{ name }}</option>
        </select>
      </label>
      <p class="text-sm text-ink-700" role="status">
        {{ count }} {{ plural(count, 'collaborateur') }}
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
      :label="`Semaine ${weekNumber}`"
      class="max-sm:w-full max-sm:justify-between sm:ml-auto"
      @previous="$emit('previous')"
      @next="$emit('next')"
    />
  </div>
</template>
