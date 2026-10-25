<script setup lang="ts">
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

defineProps<{ sendSummary: string }>()
defineEmits<{ send: []; reset: []; discard: [] }>()

const sendOpen = defineModel<boolean>('sendOpen', { required: true })
const resetOpen = defineModel<boolean>('resetOpen', { required: true })
const cancelOpen = defineModel<boolean>('cancelOpen', { required: true })
</script>

<template>
  <ConfirmDialog
    v-model:open="sendOpen"
    title="Envoyer cette demande ?"
    :description="sendSummary"
    confirm-label="Envoyer la demande"
    cancel-label="Revoir ma demande"
    @confirm="$emit('send')"
  />
  <ConfirmDialog
    v-model:open="resetOpen"
    title="Effacer votre saisie ?"
    description="Le formulaire et le brouillon enregistré seront vidés. Cette action est définitive."
    confirm-label="Effacer ma saisie"
    cancel-label="Garder ma saisie"
    tone="danger"
    @confirm="$emit('reset')"
  />
  <ConfirmDialog
    v-model:open="cancelOpen"
    title="Abandonner cette demande ?"
    description="Votre brouillon sera supprimé. Cette action est définitive."
    confirm-label="Abandonner"
    cancel-label="Continuer la saisie"
    tone="danger"
    @confirm="$emit('discard')"
  />
</template>
