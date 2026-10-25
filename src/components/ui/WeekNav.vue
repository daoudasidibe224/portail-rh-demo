<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

import IconButton from './IconButton.vue'

defineProps<{ label: string }>()
defineEmits<{ previous: []; next: [] }>()
</script>

<template>
  <div class="flex items-center gap-1">
    <IconButton label="Semaine précédente" @click="$emit('previous')">
      <ChevronLeft class="size-5" aria-hidden="true" />
    </IconButton>
    <p class="min-w-24 text-center text-sm font-medium text-ink-900" aria-live="polite">
      {{ label }}
    </p>
    <IconButton label="Semaine suivante" @click="$emit('next')">
      <ChevronRight class="size-5" aria-hidden="true" />
    </IconButton>
  </div>
</template>
