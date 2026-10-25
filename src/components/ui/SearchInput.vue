<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { useId } from 'vue'

defineProps<{
  /** Nom accessible, repris comme texte d'invite. */
  label: string
}>()
const model = defineModel<string>({ required: true })
const id = useId()
</script>

<template>
  <div class="relative min-w-0">
    <label :for="id" class="sr-only">{{ label }}</label>
    <Search
      class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-600"
      aria-hidden="true"
    />
    <input
      :id="id"
      v-model="model"
      type="search"
      autocomplete="off"
      :placeholder="label"
      class="field-input py-2 pl-10 text-sm"
    />
  </div>
</template>
