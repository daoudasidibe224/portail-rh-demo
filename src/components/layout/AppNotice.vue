<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

import { RULES } from '@/lib/rules'
</script>

<template>
  <aside aria-label="Information" class="bg-info-50 text-info-700 print:hidden">
    <p class="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 text-sm sm:px-6">
      <Info class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        Rappel : une demande de télétravail régulier se fait au moins
        {{ RULES.regularNoticeDays }} jours à l’avance.
        <RouterLink
          to="/actualites/teletravail-regulier-delai"
          class="font-semibold underline underline-offset-2"
          >En savoir plus</RouterLink
        >
      </span>
    </p>
  </aside>
</template>
