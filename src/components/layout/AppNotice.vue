<script setup lang="ts">
import { Info, X } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

import { RULES } from '@/domain/rules'
import { usePreferencesStore } from '@/stores/preferences'

const preferences = usePreferencesStore()

/* Le bandeau disparaît : le focus passe au contenu pour ne pas se perdre. */
function dismiss() {
  preferences.dismissNotice()
  document.getElementById('contenu')?.focus()
}
</script>

<template>
  <aside
    v-if="!preferences.noticeDismissed"
    aria-label="Information"
    class="bg-info-50 text-info-700 print:hidden"
  >
    <div class="mx-auto flex max-w-6xl items-start gap-3 px-4 py-1 text-sm sm:px-6">
      <Info class="mt-3 size-4 shrink-0" aria-hidden="true" />
      <p class="min-w-0 flex-1 py-2">
        Rappel : une demande de télétravail régulier se fait au moins
        {{ RULES.regularNoticeDays }} jours à l’avance, sinon elle ne peut pas être envoyée.
        <RouterLink
          to="/actualites/teletravail-regulier-delai"
          class="font-semibold underline underline-offset-2"
          >En savoir plus</RouterLink
        >
      </p>
      <button
        type="button"
        class="-mr-2 grid size-10 shrink-0 place-items-center rounded-lg hover:bg-info-700/10"
        @click="dismiss"
      >
        <X class="size-4" aria-hidden="true" />
        <span class="sr-only">Masquer cette information</span>
      </button>
    </div>
  </aside>
</template>
