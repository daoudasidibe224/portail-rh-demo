<script setup lang="ts">
import { computed } from 'vue'

import { STATUSES } from '@/domain/rules'
import type { RequestStatus } from '@/domain/types'

const props = defineProps<{ status: RequestStatus }>()

// Le repère change aussi de forme : le statut ne repose pas sur la couleur seule.
const style = computed(
  () =>
    ({
      pending: { text: 'text-warning-700', mark: 'border-2 border-warning-700' },
      approved: { text: 'text-success-700', mark: 'bg-success-700' },
      rejected: { text: 'text-brand-700', mark: 'bg-brand-700' },
      cancelled: {
        text: 'text-ink-600',
        mark: 'border-2 border-ink-400 bg-[linear-gradient(135deg,transparent_45%,var(--color-ink-400)_45%_60%,transparent_60%)]',
      },
    })[props.status],
)
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-2 text-sm font-medium whitespace-nowrap"
    :class="style.text"
  >
    <span class="block size-2.5" :class="style.mark" aria-hidden="true" />
    {{ STATUSES[status].label }}
  </span>
</template>
