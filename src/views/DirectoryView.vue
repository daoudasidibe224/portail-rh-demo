<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import EmployeeCard from '@/components/directory/EmployeeCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { searchDirectory } from '@/lib/directory'
import { plural } from '@/lib/format'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const heading = usePageHeading()

const query = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const results = computed(() => searchDirectory(portal.employees, query.value))
const hasQuery = computed(() => query.value.trim() !== '')

const status = computed(() => {
  const count = results.value.length
  if (count === 0) return 'Aucun résultat'
  if (!hasQuery.value) return `${count} ${plural(count, 'collaborateur')}`
  return `${count} ${plural(count, 'résultat')} sur ${portal.employees.length}`
})

function clear() {
  query.value = ''
  searchInput.value?.focus()
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <PageTitle ref="heading">Annuaire</PageTitle>
      <p class="mt-1 text-ink-600">Trouvez un collaborateur de démonstration et écrivez-lui.</p>
    </header>

    <div class="space-y-3">
      <form role="search" class="max-w-xl" @submit.prevent>
        <label for="directory-search" class="field-label"> Rechercher un collaborateur </label>
        <p id="directory-search-hint" class="mt-0.5 text-sm text-ink-600">
          Par prénom, nom, équipe ou poste. Les accents et les majuscules sont ignorés.
        </p>
        <div class="relative mt-1.5">
          <Search
            class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-600"
            aria-hidden="true"
          />
          <input
            id="directory-search"
            ref="searchInput"
            v-model="query"
            type="search"
            name="q"
            autocomplete="off"
            aria-describedby="directory-search-hint"
            class="field-input pl-10"
          />
        </div>
      </form>

      <p role="status" class="text-sm font-medium text-ink-700">{{ status }}</p>
    </div>

    <ul v-if="results.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="employee in results" :key="employee.id" class="flex flex-col *:flex-1">
        <EmployeeCard :employee="employee" :manager="portal.employeeById(employee.managerId)" />
      </li>
    </ul>

    <div v-else class="card px-4 py-8 sm:px-5">
      <template v-if="hasQuery">
        <p class="font-semibold text-ink-900 [overflow-wrap:anywhere]">
          Aucun collaborateur ne correspond à « {{ query.trim() }} ».
        </p>
        <p class="mt-1 text-ink-700">
          Vérifiez l’orthographe ou cherchez avec un seul mot, par exemple un prénom ou le nom d’une
          équipe.
        </p>
        <AppButton variant="secondary" class="mt-4" @click="clear">Effacer la recherche</AppButton>
      </template>
      <template v-else>
        <p class="font-semibold text-ink-900">L’annuaire est vide.</p>
        <p class="mt-1 text-ink-700">
          Réinitialisez la démo depuis le pied de page pour le remplir.
        </p>
      </template>
    </div>
  </div>
</template>
