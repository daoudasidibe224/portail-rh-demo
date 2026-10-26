<script setup lang="ts">
import { Printer, RotateCcw } from 'lucide-vue-next'

import { formatTime } from '@/lib/dateFormat'
import { useDraftStore } from '@/stores/draft'

// État du brouillon et actions associées, sous le formulaire.
defineProps<{ isLast: boolean }>()
defineEmits<{ leave: []; reset: []; print: [] }>()

const drafts = useDraftStore()

const linkClass =
  'inline-flex min-h-10 items-center gap-1.5 rounded-lg px-1 font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900'
</script>

<template>
  <p class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600 print:hidden">
    <span>
      {{
        drafts.savedAt
          ? `Brouillon enregistré à ${formatTime(drafts.savedAt)}.`
          : 'Rien à enregistrer pour l’instant.'
      }}
    </span>
    <button type="button" :class="linkClass" @click="$emit('leave')">Annuler la demande</button>
    <button v-if="drafts.dirty" type="button" :class="linkClass" @click="$emit('reset')">
      <RotateCcw class="size-4" aria-hidden="true" />
      Effacer tout
    </button>
    <button v-if="isLast" type="button" :class="linkClass" @click="$emit('print')">
      <Printer class="size-4" aria-hidden="true" />
      Imprimer
    </button>
  </p>
</template>
