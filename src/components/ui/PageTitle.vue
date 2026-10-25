<script setup lang="ts">
import { ref } from 'vue'

const heading = ref<HTMLElement | null>(null)

defineExpose({ focus: () => heading.value?.focus() })
</script>

<template>
  <h1
    id="page-title"
    ref="heading"
    tabindex="-1"
    class="font-condensed text-4xl font-semibold text-ink-900"
  >
    <slot />
  </h1>
</template>
