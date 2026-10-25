<script setup lang="ts">
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const open = defineModel<boolean>('open', { required: true })

defineProps<{ authorName: string }>()
defineEmits<{ confirm: [comment: string] }>()
</script>

<template>
  <ConfirmDialog
    v-model:open="open"
    :title="`Refuser la demande de ${authorName} ?`"
    description="Expliquez votre décision : le motif sera visible par le collaborateur."
    confirm-label="Refuser"
    tone="danger"
    comment-label="Motif du refus"
    comment-required
    @confirm="$emit('confirm', $event)"
  />
</template>
