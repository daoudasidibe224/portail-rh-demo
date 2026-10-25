<script setup lang="ts">
import AttachmentField from '@/components/request/AttachmentField.vue'
import FieldError from '@/components/request/FieldError.vue'
import { COST_CENTERS, REASONS, REASON_ORDER } from '@/domain/rules'
import type { ValidationError } from '@/domain/validation'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

import { ANCHORS as anchors, useFieldState } from './anchors'

const props = defineProps<{ errors: readonly ValidationError[] }>()

const portal = usePortalStore()
const drafts = useDraftStore()
const { fieldErrors, invalid, describedBy } = useFieldState(() => props.errors)
</script>

<template>
  <div class="space-y-6">
    <div>
      <label :for="anchors.reason" class="field-label">
        Motif <span class="font-normal text-ink-600">(obligatoire)</span>
      </label>
      <select
        :id="anchors.reason"
        v-model="drafts.draft.reason"
        aria-required="true"
        :aria-invalid="invalid('reason') || undefined"
        :aria-describedby="describedBy('reason')"
        class="field-input mt-1.5"
      >
        <option value="" disabled>-- Motif --</option>
        <option v-for="reason in REASON_ORDER" :key="reason" :value="reason">
          {{ REASONS[reason] }}
        </option>
      </select>
      <FieldError id="reason-error" :messages="fieldErrors('reason')" />
    </div>

    <div>
      <label for="cost-center" class="field-label">Centre de coût</label>
      <select id="cost-center" v-model="drafts.draft.costCenter" class="field-input mt-1.5">
        <option value="" disabled>-- Sélectionner --</option>
        <option
          v-for="center in COST_CENTERS"
          :key="center.value"
          :value="center.value"
          :disabled="center.disabled"
        >
          {{ center.label }}
        </option>
      </select>
    </div>

    <div>
      <label :for="anchors.comment" class="field-label">
        Message pour {{ portal.manager ? portal.manager.firstName : 'votre manager' }}
        <span class="font-normal text-ink-600">
          ({{ drafts.draft.reason === 'other' ? 'obligatoire' : 'facultatif' }})
        </span>
      </label>
      <textarea
        :id="anchors.comment"
        v-model="drafts.draft.comment"
        rows="3"
        :aria-invalid="invalid('comment') || undefined"
        :aria-describedby="describedBy('comment')"
        class="field-input mt-1.5"
      />
      <FieldError id="comment-error" :messages="fieldErrors('comment')" />
    </div>

    <AttachmentField />
  </div>
</template>
