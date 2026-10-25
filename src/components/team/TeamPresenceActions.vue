<script setup lang="ts">
import { Download, Printer } from 'lucide-vue-next'

import AppButton from '@/components/ui/AppButton.vue'

defineProps<{ canExport: boolean }>()
defineEmits<{ export: []; print: [] }>()
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-2 border-t border-ink-200 px-4 py-2 sm:px-5 print:hidden"
  >
    <span class="mr-1 text-sm text-ink-700">Cette semaine :</span>
    <AppButton variant="ghost" size="sm" :disabled="!canExport" @click="$emit('export')">
      <Download class="size-4" aria-hidden="true" /> Exporter en CSV
    </AppButton>
    <AppButton variant="ghost" size="sm" @click="$emit('print')">
      <Printer class="size-4" aria-hidden="true" /> Imprimer
    </AppButton>
  </div>
</template>
