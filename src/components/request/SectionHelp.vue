<script setup lang="ts">
import { CircleQuestionMark } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'

import AppButton from '@/components/ui/AppButton.vue'

// À placer dans une section en `relative` : le bouton se range en haut à droite.
defineProps<{ title: string }>()
</script>

<template>
  <DialogRoot>
    <DialogTrigger as-child>
      <button
        type="button"
        class="absolute top-2 right-2 grid size-10 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-900 print:hidden"
      >
        <CircleQuestionMark class="size-5" aria-hidden="true" />
        <span class="sr-only">Aide : {{ title }}</span>
      </button>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />
      <DialogContent class="dialog-panel max-h-[85dvh] max-w-lg">
        <DialogTitle class="text-lg font-semibold text-ink-900">{{ title }}</DialogTitle>
        <DialogDescription class="sr-only"
          >Explications sur cette partie du formulaire.</DialogDescription
        >
        <div class="mt-3 space-y-2 text-sm text-ink-700"><slot /></div>
        <DialogClose as-child>
          <AppButton class="mt-6" block>J’ai compris</AppButton>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
