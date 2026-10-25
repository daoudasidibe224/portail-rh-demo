<script setup lang="ts">
import { Copy, Printer } from 'lucide-vue-next'
import { ref } from 'vue'

import AppButton from '@/components/ui/AppButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import type { TeleworkRequest } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

defineProps<{ request: TeleworkRequest; isMine: boolean }>()
const emit = defineEmits<{ approve: []; cancel: []; reject: [comment: string] }>()

const portal = usePortalStore()
const cancelOpen = ref(false)
const rejectOpen = ref(false)

const print = () => window.print()
</script>

<template>
  <div class="mt-6 flex flex-col gap-2 sm:flex-row print:hidden">
    <template v-if="isMine">
      <AppButton variant="secondary" :to="{ name: 'new-request', query: { depuis: request.id } }">
        <Copy class="size-4" aria-hidden="true" /> Refaire une demande similaire
      </AppButton>
      <AppButton v-if="portal.canCancel(request)" variant="danger" @click="cancelOpen = true">
        Annuler la demande
      </AppButton>
    </template>
    <template v-else-if="request.status === 'pending'">
      <AppButton @click="emit('approve')">Valider</AppButton>
      <AppButton variant="danger" @click="rejectOpen = true">Refuser</AppButton>
    </template>
    <AppButton variant="secondary" class="sm:ml-auto" @click="print">
      <Printer class="size-4" aria-hidden="true" /> Imprimer
    </AppButton>
  </div>

  <ConfirmDialog
    v-model:open="cancelOpen"
    title="Annuler cette demande ?"
    :description="
      request.type === 'occasional' || request.type === 'mixed'
        ? 'Les jours seront recrédités sur votre solde.'
        : 'Votre manager sera informé(e).'
    "
    confirm-label="Annuler la demande"
    cancel-label="Garder la demande"
    tone="danger"
    @confirm="emit('cancel')"
  />
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
