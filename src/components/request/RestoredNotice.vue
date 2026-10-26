<script setup lang="ts">
import { Info } from 'lucide-vue-next'

import { formatDateTime } from '@/lib/dateFormat'
import { useDraftStore } from '@/stores/draft'

const drafts = useDraftStore()
</script>

<template>
  <p
    v-if="drafts.restored"
    class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-info-50 px-4 py-3 text-sm text-info-700"
  >
    <Info class="size-4 shrink-0" aria-hidden="true" />
    <span
      >Nous avons repris votre brouillon<template v-if="drafts.savedAt">
        du {{ formatDateTime(drafts.savedAt) }}</template
      >.</span
    >
  </p>
</template>
