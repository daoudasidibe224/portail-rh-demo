<script setup lang="ts">
import SearchInput from '@/components/ui/SearchInput.vue'
import { REQUEST_TYPES, SUBMITTABLE_TYPES } from '@/domain/rules'
import { TRIAGE_SORTS, type TriageFilters } from '@/domain/triage'

const filters = defineModel<TriageFilters>('filters', { required: true })
</script>

<template>
  <form
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
        <option v-for="key in SUBMITTABLE_TYPES" :key="key" :value="key">
          {{ REQUEST_TYPES[key].label }}
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
</template>
