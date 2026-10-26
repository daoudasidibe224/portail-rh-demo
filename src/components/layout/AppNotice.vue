<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import { RULES } from '@/lib/rules'

const open = ref(true)

/* Le bandeau disparaît : le focus passe au contenu pour ne pas se perdre. */
function close() {
  open.value = false
  document.getElementById('contenu')?.focus()
}
</script>

<template>
  <aside v-if="open" aria-label="Information" class="bg-info-50 text-info-700 print:hidden">
    <p
      class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-0 px-4 py-1 text-sm sm:px-6"
    >
      <span class="flex items-start gap-2 py-1.5">
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
      </span>
      <button
        type="button"
        class="inline-flex min-h-10 items-center font-semibold underline underline-offset-2 hover:text-info-700"
        @click="close"
      >
        Fermer
      </button>
    </p>
  </aside>
</template>
