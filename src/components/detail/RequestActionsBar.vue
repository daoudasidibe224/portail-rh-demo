<script setup lang="ts">
import { ref } from 'vue'

import AppButton from '@/components/ui/AppButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import type { TeleworkRequest } from '@/domain/types'

defineProps<{ request: TeleworkRequest }>()
const emit = defineEmits<{ approve: []; reject: [comment: string] }>()

const rejectOpen = ref(false)
</script>

<template>
  <div class="mt-6 flex flex-col gap-2 sm:flex-row">
    <AppButton @click="emit('approve')">Valider</AppButton>
    <AppButton variant="danger" @click="rejectOpen = true">Refuser</AppButton>
  </div>

  <ConfirmDialog
    v-model:open="rejectOpen"
    title="Refuser la demande ?"
    confirm-label="Refuser"
    tone="danger"
    comment-label="Motif du refus"
    comment-required
    @confirm="(c) => emit('reject', c)"
  />
</template>
