<script setup lang="ts">
import CommitmentFields from '@/components/request/CommitmentFields.vue'
import PlanningPreview from '@/components/request/PlanningPreview.vue'
import RequestSummary from '@/components/request/RequestSummary.vue'
import { useRequestTarget } from '@/composables/useRequestTarget'
import { CONTACT } from '@/domain/contact'
import type { ValidationError } from '@/domain/validation'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

defineProps<{ errors: readonly ValidationError[] }>()
// Appliquée à l'envoi seulement : abandonner la demande ne change pas l'abonnement.
const newsletter = defineModel<boolean>('newsletter', { required: true })

const portal = usePortalStore()
const drafts = useDraftStore()
const { target } = useRequestTarget()
</script>

<template>
  <div class="space-y-6">
    <RequestSummary detailed />
    <p class="text-sm text-ink-600">
      Une information est inexacte ? Écrivez à
      <a
        :href="`mailto:${CONTACT.email}`"
        class="font-medium text-ink-900 underline underline-offset-2"
        >{{ CONTACT.email }}</a
      >.
    </p>

    <details class="group rounded-lg border border-ink-200 print:hidden">
      <summary
        class="flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold text-ink-900 marker:text-ink-600"
      >
        Voir mon planning prévisionnel
      </summary>
      <div class="border-t border-ink-200 p-4">
        <PlanningPreview
          :draft="drafts.draft"
          :requests="portal.requests"
          :employee-id="target?.id ?? ''"
        />
      </div>
    </details>

    <CommitmentFields v-model:newsletter="newsletter" :errors="errors" />
  </div>
</template>
