<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'
import { nextTick, ref, watch } from 'vue'

import type { FieldKey, ValidationError } from '@/domain/validation'

const props = defineProps<{
  errors: readonly ValidationError[]
  /** Incrémenté à chaque tentative d'envoi : déclenche le focus. */
  attempt: number
  anchors: Record<FieldKey, string>
}>()

const root = ref<HTMLElement | null>(null)

// Focus sur le récapitulatif après un envoi refusé.
watch(
  () => props.attempt,
  async () => {
    await nextTick()
    root.value?.focus()
  },
)

function focusField(field: FieldKey) {
  const target = document.getElementById(props.anchors[field])
  const focusable = target?.matches('input, textarea, select, button, [tabindex]')
    ? target
    : target?.querySelector<HTMLElement>(
        'input:not([type=hidden]), textarea, select, button, [tabindex="0"]',
      )
  target?.scrollIntoView({ block: 'center' })
  focusable?.focus()
}
</script>

<template>
  <div
    v-if="errors.length"
    ref="root"
    tabindex="-1"
    role="region"
    aria-labelledby="error-summary-title"
    class="rounded-xl border-2 border-brand-700 bg-white p-4 sm:p-5"
  >
    <h2 id="error-summary-title" class="flex items-center gap-2 font-semibold text-brand-700">
      <CircleAlert class="size-5" aria-hidden="true" />
      {{ errors.length > 1 ? `${errors.length} points à corriger` : '1 point à corriger' }}
    </h2>
    <ul class="mt-1 list-disc pl-6 text-sm text-ink-900">
      <li v-for="(error, i) in errors" :key="i">
        <a
          :href="`#${anchors[error.field]}`"
          class="block py-2.5 underline underline-offset-2 hover:text-brand-700"
          @click.prevent="focusField(error.field)"
        >
          {{ error.message }}
        </a>
      </li>
    </ul>
  </div>
</template>
