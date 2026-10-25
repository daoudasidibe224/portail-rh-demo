<script setup lang="ts">
import { ref } from 'vue'

import StepDetails from '@/components/request/StepDetails.vue'
import StepReview from '@/components/request/StepReview.vue'
import StepWhen from '@/components/request/StepWhen.vue'
import { REQUEST_STEPS } from '@/domain/steps'
import type { ValidationError } from '@/domain/validation'

defineProps<{
  step: number
  errors: readonly ValidationError[]
  /** Dernière étape : seule celle-ci s'imprime. */
  printable?: boolean
}>()
// Appliquée à l'envoi seulement : abandonner la demande ne change pas l'abonnement.
const newsletter = defineModel<boolean>('newsletter', { required: true })

const title = ref<HTMLElement | null>(null)
defineExpose({ focus: () => title.value?.focus() })
</script>

<template>
  <section
    class="card relative p-4 sm:p-6"
    :class="printable ? '' : 'print:hidden'"
    aria-labelledby="step-title"
  >
    <h2 id="step-title" ref="title" tabindex="-1" class="pr-10 text-xl font-semibold text-ink-900">
      {{ REQUEST_STEPS[step]?.title }}
    </h2>
    <p class="mt-1 text-sm text-ink-600">{{ REQUEST_STEPS[step]?.hint }}</p>
    <div class="mt-6">
      <StepWhen v-if="step === 0" :errors="errors" />
      <StepDetails v-else-if="step === 1" :errors="errors" />
      <StepReview v-else v-model:newsletter="newsletter" :errors="errors" />
    </div>
  </section>
</template>
