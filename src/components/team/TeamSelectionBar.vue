<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import { plural } from '@/domain/format'

defineProps<{ count: number; total: number; canSelectAll: boolean }>()
defineEmits<{ approve: []; clear: []; 'select-all': [] }>()
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-200 bg-ink-50 px-4 py-2 sm:px-5"
  >
    <p class="text-sm font-semibold text-ink-900" role="status">
      {{ count }} {{ plural(count, 'demande') }}
      {{ plural(count, 'sélectionnée') }}
    </p>
    <AppButton variant="solid" size="sm" @click="$emit('approve')">
      Valider la sélection
    </AppButton>
    <AppButton variant="ghost" size="sm" @click="$emit('clear')"> Tout désélectionner </AppButton>
    <button
      v-if="canSelectAll"
      type="button"
      class="link-action -my-2 inline-block py-2 text-sm"
      @click="$emit('select-all')"
    >
      Sélectionner les {{ total }} demandes
    </button>
  </div>
</template>
