<script setup lang="ts">
import { ArrowLeft, Send } from 'lucide-vue-next'

import AppButton from '@/components/ui/AppButton.vue'
import { useRequestSummary } from '@/composables/useRequestSummary'

// Barre fixe sur téléphone : résumé de la demande et bouton d'étape.
defineProps<{ step: number; isLast: boolean }>()
defineEmits<{ back: [] }>()

const { barTitle, barDetail, overBalance } = useRequestSummary()
</script>

<template>
  <div
    data-action-bar
    class="sticky bottom-0 z-20 -mx-4 flex items-center gap-3 border-t border-ink-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgb(0_0_0/0.06)] sm:-mx-6 sm:px-6 lg:hidden print:hidden [@media(max-height:30rem)]:static"
  >
    <button
      v-if="step > 0"
      type="button"
      class="grid size-11 shrink-0 place-items-center rounded-lg text-ink-700 hover:bg-ink-100"
      @click="$emit('back')"
    >
      <ArrowLeft class="size-5" aria-hidden="true" />
      <span class="sr-only">Étape précédente</span>
    </button>
    <p class="min-w-0 flex-1 text-sm leading-snug text-ink-700">
      <span class="block font-semibold text-ink-900">{{ barTitle }}</span>
      <span v-if="barDetail" class="block" :class="overBalance ? 'font-medium text-brand-700' : ''">
        {{ barDetail }}
      </span>
    </p>
    <AppButton type="submit" size="lg" class="shrink max-[22rem]:max-w-44">
      <template v-if="isLast">
        <Send class="size-4 shrink-0" aria-hidden="true" />
        Envoyer
      </template>
      <template v-else>Continuer</template>
    </AppButton>
  </div>
</template>

<style>
/* Évite que la barre fixe cache le champ focalisé. */
@media (max-width: 63.99rem) and (min-height: 30.01rem) {
  html:has([data-action-bar]) {
    scroll-padding-bottom: 6rem;
  }
}
</style>
