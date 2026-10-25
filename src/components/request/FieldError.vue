<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'

defineProps<{ id: string; messages: readonly string[] }>()
</script>

<template>
  <div v-if="messages.length" :id="id" class="mt-2 space-y-1">
    <p
      v-for="message in messages"
      :key="message"
      class="flex gap-1.5 text-sm font-medium text-brand-700"
    >
      <CircleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span><span class="sr-only">Erreur : </span>{{ message }}</span>
    </p>
  </div>
</template>
