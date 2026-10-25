<script setup lang="ts">
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from 'reka-ui'
import { ref, useId, watch } from 'vue'

import FieldError from '@/components/request/FieldError.vue'
import { RULES } from '@/domain/rules'

import AppButton from './AppButton.vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    confirmLabel: string
    cancelLabel?: string
    tone?: 'primary' | 'danger'
    /** Affiche un champ commentaire, obligatoire si `commentRequired`. */
    commentLabel?: string
    commentRequired?: boolean
  }>(),
  {
    description: undefined,
    cancelLabel: 'Retour',
    tone: 'primary',
    commentLabel: undefined,
    commentRequired: false,
  },
)

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [comment: string] }>()

const comment = ref('')
const error = ref('')
const commentField = ref<HTMLTextAreaElement | null>(null)
const id = useId()

watch(open, (value) => {
  if (value) {
    comment.value = ''
    error.value = ''
  }
})

function confirm() {
  if (props.commentRequired && !comment.value.trim()) {
    error.value = 'Ce champ est obligatoire : il sera transmis au collaborateur.'
    commentField.value?.focus()
    return
  }
  emit('confirm', comment.value.trim())
  open.value = false
}
</script>

<template>
  <AlertDialogRoot v-model:open="open">
    <AlertDialogPortal>
      <AlertDialogOverlay class="dialog-overlay" />
      <AlertDialogContent class="dialog-panel max-h-[calc(100dvh-2rem)] max-w-md">
        <AlertDialogTitle class="text-lg font-semibold text-ink-900">{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description" class="mt-2 text-sm text-ink-700">
          {{ description }}
        </AlertDialogDescription>
        <slot />

        <div v-if="commentLabel" class="mt-4">
          <label :for="`${id}-comment`" class="field-label">
            {{ commentLabel }}
            <span v-if="commentRequired" class="font-normal text-ink-600">(obligatoire)</span>
          </label>
          <textarea
            :id="`${id}-comment`"
            ref="commentField"
            v-model="comment"
            rows="3"
            :maxlength="RULES.commentMaxLength"
            class="field-input mt-1.5"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="error ? `${id}-error` : undefined"
            :aria-required="commentRequired || undefined"
          />
          <FieldError :id="`${id}-error`" :messages="error ? [error] : []" />
        </div>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel as-child>
            <AppButton variant="secondary">{{ cancelLabel }}</AppButton>
          </AlertDialogCancel>
          <AppButton :variant="tone === 'danger' ? 'danger' : 'primary'" @click="confirm">
            {{ confirmLabel }}
          </AppButton>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
