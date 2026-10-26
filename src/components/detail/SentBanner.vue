<script setup lang="ts">
import { CircleCheck } from 'lucide-vue-next'

defineProps<{ managerName: string | null }>()
</script>

<template>
  <div
    role="status"
    class="mt-4 flex gap-3 rounded-lg border border-success-700/30 bg-success-50 p-4 text-success-700"
  >
    <CircleCheck class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
    <p>
      <strong>Votre demande a été transmise.</strong>
      {{ managerName ?? 'Votre manager' }} a reçu la demande et vous recevrez sa réponse sur ce
      portail.
    </p>
  </div>
</template>
