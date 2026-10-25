<script setup lang="ts">
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { plural } from '@/domain/format'

const open = defineModel<boolean>('open', { required: true })

defineProps<{ title: string; names: string; count: number }>()
defineEmits<{ confirm: [] }>()
</script>

<template>
  <ConfirmDialog
    v-model:open="open"
    :title="title"
    :description="`${names} Les collaborateurs seront prévenus. Un refus se fait toujours demande par demande, avec un motif.`"
    :confirm-label="`Valider ${count} ${plural(count, 'demande')}`"
    @confirm="$emit('confirm')"
  />
</template>
