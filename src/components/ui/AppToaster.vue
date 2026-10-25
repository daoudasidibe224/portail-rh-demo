<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, X } from 'lucide-vue-next'
import {
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from 'reka-ui'

import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
const icons = { success: CircleCheck, info: Info, error: CircleAlert }
</script>

<template>
  <ToastProvider label="Notification" swipe-direction="right" :duration="6000">
    <slot />
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.tone === 'error' ? 'foreground' : 'background'"
      class="toast-item flex items-start gap-3 rounded-xl bg-ink-900 p-4 text-white shadow-xl"
      @update:open="(open) => !open && dismiss(toast.id)"
    >
      <component :is="icons[toast.tone]" class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div class="min-w-0 flex-1">
        <ToastTitle class="font-semibold">{{ toast.title }}</ToastTitle>
        <ToastDescription v-if="toast.description" class="mt-0.5 text-sm text-ink-200">
          {{ toast.description }}
        </ToastDescription>
      </div>
      <ToastClose
        class="-m-2 grid size-10 place-items-center rounded-lg text-ink-200 hover:bg-white/10 hover:text-white"
        aria-label="Fermer la notification"
      >
        <X class="size-4" aria-hidden="true" />
      </ToastClose>
    </ToastRoot>
    <ToastViewport
      class="fixed inset-x-0 top-0 z-50 flex w-full flex-col gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))] outline-none sm:inset-x-auto sm:top-auto sm:right-0 sm:bottom-0 sm:max-w-sm sm:pt-4"
    />
  </ToastProvider>
</template>
