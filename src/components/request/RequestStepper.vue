<script setup lang="ts">
import { Check, ChevronRight } from 'lucide-vue-next'

import { REQUEST_STEPS } from '@/lib/steps'

defineProps<{
  current: number
  /** Dernière étape déjà atteinte : on peut y revenir sans perdre sa saisie. */
  reached: number
}>()
defineEmits<{ go: [index: number] }>()
</script>

<template>
  <nav aria-label="Étapes de la demande" class="print:hidden">
    <!-- Téléphone : une ligne de texte et une fine barre. -->
    <div class="sm:hidden">
      <p class="text-sm font-medium text-ink-700">
        Étape {{ current + 1 }} sur {{ REQUEST_STEPS.length }} : {{ REQUEST_STEPS[current]?.short }}
      </p>
      <div class="mt-1 flex gap-1">
        <template v-for="(step, index) in REQUEST_STEPS" :key="step.id">
          <button
            v-if="index <= reached && index !== current"
            type="button"
            class="flex h-6 flex-1 items-center"
            @click="$emit('go', index)"
          >
            <span class="h-1 w-full rounded-full bg-ink-400" aria-hidden="true" />
            <span class="sr-only">Revenir à l’étape {{ index + 1 }} : {{ step.short }}</span>
          </button>
          <span v-else class="flex h-6 flex-1 items-center" aria-hidden="true">
            <span
              class="h-1 w-full rounded-full"
              :class="index <= current ? 'bg-ink-900' : 'bg-ink-200'"
            />
          </span>
        </template>
      </div>
    </div>

    <!-- Écran large : les trois étapes sur une ligne. -->
    <ol class="hidden items-center gap-1 text-sm sm:flex">
      <li v-for="(step, index) in REQUEST_STEPS" :key="step.id" class="flex items-center gap-1">
        <ChevronRight v-if="index > 0" class="size-4 text-ink-400" aria-hidden="true" />
        <button
          v-if="index <= reached && index !== current"
          type="button"
          class="inline-flex min-h-8 items-center gap-1.5 rounded-md px-1.5 text-ink-700 underline underline-offset-2 hover:text-ink-900"
          @click="$emit('go', index)"
        >
          <Check class="size-4 shrink-0" aria-hidden="true" />
          <span class="sr-only">Étape {{ index + 1 }} : </span>{{ step.short }}
        </button>
        <span
          v-else
          class="inline-flex min-h-8 items-center gap-1.5 px-1.5"
          :class="index === current ? 'font-semibold text-ink-900' : 'text-ink-600'"
          :aria-current="index === current ? 'step' : undefined"
        >
          <span
            class="grid size-5 shrink-0 place-items-center rounded-full text-xs"
            :class="index === current ? 'bg-ink-900 text-white' : 'border border-ink-400'"
            aria-hidden="true"
            >{{ index + 1 }}</span
          >
          <span class="sr-only">Étape {{ index + 1 }} : </span>{{ step.short }}
        </span>
      </li>
    </ol>
  </nav>
</template>
