<script setup lang="ts">
import { FileText, MessageSquare } from 'lucide-vue-next'

import type { TeleworkRequest } from '@/domain/types'

defineProps<{ request: Pick<TeleworkRequest, 'comment' | 'attachment'> }>()
</script>

<template>
  <span v-if="request.comment" class="inline-flex items-center gap-1 text-ink-600">
    <MessageSquare class="size-4" aria-hidden="true" /> Message
  </span>
  <span v-if="request.attachment" class="inline-flex items-center gap-1 text-ink-600">
    <FileText class="size-4" aria-hidden="true" /> Justificatif
  </span>
</template>
