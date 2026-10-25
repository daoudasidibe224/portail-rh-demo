<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <button
    type="button"
    class="grid size-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100"
    :aria-label="label"
  >
    <slot />
  </button>
</template>
