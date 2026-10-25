<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

import CharterContent from '@/components/request/CharterContent.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { RULES } from '@/domain/rules'

const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent class="dialog-panel max-h-[85dvh] max-w-lg">
        <DialogTitle class="text-lg font-semibold text-ink-900">
          Charte du télétravail ({{ RULES.charterVersion }}) : l’essentiel
        </DialogTitle>
        <DialogDescription class="mt-1 text-sm text-ink-600">
          Lisez ces règles avant de l’accepter. Elles sont aussi sur la page de la charte.
        </DialogDescription>
        <CharterContent class="mt-4 text-sm" />
        <DialogClose as-child>
          <AppButton class="mt-6" block>J’ai compris</AppButton>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
