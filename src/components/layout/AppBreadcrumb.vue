<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { pageTitle, parentOverride } from '@/composables/usePageTitle'

const route = useRoute()
const router = useRouter()

/** Ancêtres de la page courante, du plus haut au plus proche (Accueil › Mon télétravail). */
const ancestors = computed(() => {
  const chain: { name: string; title: string }[] = []
  let parent = parentOverride.value ?? route.meta.parent
  while (parent) {
    const record = router.getRoutes().find((r) => r.name === parent)
    if (!record) break
    chain.unshift({ name: parent, title: record.meta.title })
    parent = record.meta.parent
  }
  return chain
})

// Affiché à partir du deuxième niveau : sous le premier, le menu suffit.
const visible = computed(() => ancestors.value.length > 1)
</script>

<template>
  <nav v-if="visible" aria-label="Fil d’Ariane" class="mb-6 text-sm text-ink-600 print:hidden">
    <ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <li v-for="item in ancestors" :key="item.name" class="flex items-center gap-1.5">
        <RouterLink
          :to="{ name: item.name }"
          class="inline-flex min-h-8 items-center underline underline-offset-2 hover:text-ink-900"
        >
          {{ item.title }}
        </RouterLink>
        <ChevronRight class="size-3.5 shrink-0" aria-hidden="true" />
      </li>
      <li aria-current="page" class="font-medium text-ink-900">
        {{ pageTitle ?? route.meta.title }}
      </li>
    </ol>
  </nav>
</template>
