<script setup lang="ts">
import { ArrowLeft, Send } from 'lucide-vue-next'

import AppButton from '@/components/ui/AppButton.vue'

// Boutons de navigation du formulaire sur grand écran ; le bouton d'envoi soumet le formulaire.
defineProps<{ step: number; isLast: boolean }>()
defineEmits<{ back: []; cancel: [] }>()
</script>

<template>
  <div class="flex items-center justify-between gap-3 max-lg:hidden print:hidden">
    <AppButton variant="ghost" @click="step === 0 ? $emit('cancel') : $emit('back')">
      <ArrowLeft v-if="step > 0" class="size-4" aria-hidden="true" />
      {{ step === 0 ? 'Annuler' : 'Retour' }}
    </AppButton>
    <AppButton type="submit" size="lg">
      <template v-if="isLast">
        <Send class="size-4" aria-hidden="true" />
        Envoyer la demande
      </template>
      <template v-else>Étape suivante</template>
    </AppButton>
  </div>
</template>
