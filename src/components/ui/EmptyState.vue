<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div class="px-5 py-8">
    <p class="font-semibold text-ink-900">{{ title }}</p>
    <p class="mt-1 text-ink-700"><slot /></p>
  </div>
</template>
