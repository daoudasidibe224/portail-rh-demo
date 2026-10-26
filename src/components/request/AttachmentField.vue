<script setup lang="ts">
import { FileText, Paperclip, X } from 'lucide-vue-next'
import { computed, nextTick, ref } from 'vue'

import FieldError from '@/components/request/FieldError.vue'
import { formatBytes } from '@/lib/format'
import { ATTACHMENT_ACCEPT, ATTACHMENT_LABEL, RULES } from '@/lib/rules'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

import { ANCHORS as anchors, useFieldState } from './anchors'

const portal = usePortalStore()
const drafts = useDraftStore()

// Le justificatif est contrôlé dès son ajout : un fichier refusé se voit tout de suite.
const attachmentErrors = computed(() =>
  portal.validate(drafts.draft).filter((error) => error.field === 'attachment'),
)
const attachmentState = useFieldState(attachmentErrors)

function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  // Seules les métadonnées sont gardées : pas de back-end pour recevoir le fichier.
  drafts.draft.attachment = file ? { name: file.name, size: file.size, type: file.type } : null
}
const fileInput = ref<HTMLInputElement | null>(null)
async function removeFile() {
  drafts.draft.attachment = null
  // Le champ fichier revient dans le DOM une fois le justificatif retiré.
  await nextTick()
  if (fileInput.value) fileInput.value.value = ''
  fileInput.value?.focus()
}
</script>

<template>
  <div>
    <span class="field-label">
      Justificatif <span class="font-normal text-ink-600">(facultatif)</span>
    </span>
    <p id="attachment-hint" class="mt-0.5 text-sm text-ink-600">
      {{ ATTACHMENT_LABEL }} uniquement, {{ formatBytes(RULES.attachmentMaxBytes) }} maximum.
      Exemple : préavis de grève, convocation ou attestation de travaux.
    </p>
    <div
      v-if="drafts.draft.attachment"
      class="mt-2 flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2"
    >
      <FileText class="size-5 shrink-0 text-ink-600" aria-hidden="true" />
      <span class="min-w-0 flex-1 text-sm">
        <span class="block truncate text-ink-900">{{ drafts.draft.attachment.name }}</span>
        <span class="block text-ink-600">{{ formatBytes(drafts.draft.attachment.size) }}</span>
      </span>
      <button
        type="button"
        class="grid size-10 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
        :aria-label="`Retirer ${drafts.draft.attachment.name}`"
        @click="removeFile"
      >
        <X class="size-4" aria-hidden="true" />
      </button>
    </div>
    <label
      v-else
      class="mt-2 flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-400 px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 has-focus-visible:outline-3 has-focus-visible:outline-info-700"
    >
      <Paperclip class="size-4" aria-hidden="true" />
      Ajouter un fichier
      <input
        :id="anchors.attachment"
        ref="fileInput"
        type="file"
        :accept="ATTACHMENT_ACCEPT"
        class="sr-only"
        :aria-describedby="attachmentState.describedBy('attachment', 'attachment-hint')"
        :aria-invalid="attachmentState.invalid('attachment') || undefined"
        @change="onFile"
      />
    </label>
    <FieldError id="attachment-error" :messages="attachmentState.fieldErrors('attachment')" />
  </div>
</template>
