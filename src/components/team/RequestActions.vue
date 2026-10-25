<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'

defineProps<{ name: string; size?: 'sm' | 'md' }>()
defineEmits<{ approve: []; reject: [] }>()
</script>

<template>
  <AppButton
    variant="solid"
    :size="size"
    :aria-label="`Valider la demande de ${name}`"
    @click="$emit('approve')"
  >
    Valider
  </AppButton>
  <AppButton
    variant="danger"
    :size="size"
    :aria-label="`Refuser la demande de ${name}`"
    @click="$emit('reject')"
  >
    Refuser
  </AppButton>
</template>
