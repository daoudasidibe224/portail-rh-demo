<script setup lang="ts">
import { Users } from 'lucide-vue-next'

defineProps<{ count: number; total: number }>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <Users class="size-4 shrink-0" aria-hidden="true" />
    {{ count }} sur {{ total }} déjà à distance
  </span>
</template>
