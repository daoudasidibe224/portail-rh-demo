<script setup lang="ts">
import { computed } from 'vue'

import DayPicker from '@/components/request/DayPicker.vue'
import FieldError from '@/components/request/FieldError.vue'
import TypeChoice from '@/components/request/TypeChoice.vue'
import WhoPicker from '@/components/request/WhoPicker.vue'
import WeeklyPattern from '@/components/request/WeeklyPattern.vue'
import { addDays } from '@/lib/dates'
import { formatFull } from '@/lib/dateFormat'
import { RULES } from '@/lib/rules'
import type { RequestType } from '@/lib/types'
import type { ValidationError } from '@/lib/validation'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

import { ANCHORS as anchors, useFieldState } from './anchors'

const props = defineProps<{ errors: readonly ValidationError[] }>()

const portal = usePortalStore()
const drafts = useDraftStore()
const { fieldErrors, invalid, describedBy } = useFieldState(() => props.errors)

const type = computed({
  get: () => drafts.draft.type,
  set: (value: RequestType) => drafts.setType(value),
})
const showDates = computed(() => type.value !== 'absence' && type.value !== 'unused')
const showDays = computed(() => type.value !== 'regular')
const showRhythm = computed(() => type.value === 'regular' || type.value === 'mixed')
const datesTitle = computed(() =>
  type.value === 'regular'
    ? 'Répartition et période'
    : type.value === 'mixed'
      ? 'Jours choisis et répartition'
      : 'Dates',
)
const earliestRegularStart = computed(() => addDays(portal.today, RULES.regularNoticeDays))
</script>

<template>
  <div class="space-y-8">
    <WhoPicker v-if="portal.teamMembers.length" :errors="errors" />

    <div :id="anchors.type">
      <TypeChoice
        v-model="type"
        :invalid="invalid('type')"
        :described-by="invalid('type') ? 'type-error' : undefined"
      />
      <FieldError id="type-error" :messages="fieldErrors('type')" />
    </div>

    <section v-if="showDates" aria-labelledby="dates-title">
      <h3 id="dates-title" class="text-base font-semibold text-ink-900">{{ datesTitle }}</h3>

      <div v-if="showDays" class="mt-4">
        <DayPicker
          :id="anchors.days"
          v-model="drafts.draft.days"
          :today="portal.today"
          :described-by="describedBy('days')"
          :invalid="invalid('days')"
        />
        <FieldError id="days-error" :messages="fieldErrors('days')" />
      </div>

      <div v-if="showRhythm" class="space-y-6" :class="showDays ? 'mt-8' : 'mt-4'">
        <div>
          <WeeklyPattern
            :id="anchors.weeklySlots"
            v-model="drafts.draft.weeklySlots"
            :described-by="describedBy('weeklySlots')"
            :invalid="invalid('weeklySlots')"
          />
          <FieldError id="weeklySlots-error" :messages="fieldErrors('weeklySlots')" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label :for="anchors.startDate" class="field-label">
              Date de début <span class="font-normal text-ink-600">(obligatoire)</span>
            </label>
            <p id="start-hint" class="mt-0.5 text-sm text-ink-600">
              Au plus tôt le {{ formatFull(earliestRegularStart) }}
            </p>
            <input
              :id="anchors.startDate"
              v-model="drafts.draft.startDate"
              type="date"
              :min="earliestRegularStart"
              aria-required="true"
              :aria-invalid="invalid('startDate') || undefined"
              :aria-describedby="describedBy('startDate', 'start-hint')"
              class="field-input mt-1.5"
            />
            <FieldError id="startDate-error" :messages="fieldErrors('startDate')" />
          </div>
          <div>
            <label :for="anchors.endDate" class="field-label">
              Date de fin <span class="font-normal text-ink-600">(facultatif)</span>
            </label>
            <p id="end-hint" class="mt-0.5 text-sm text-ink-600">
              Sans date de fin, la répartition continue
            </p>
            <input
              :id="anchors.endDate"
              v-model="drafts.draft.endDate"
              type="date"
              :min="drafts.draft.startDate || earliestRegularStart"
              :aria-invalid="invalid('endDate') || undefined"
              :aria-describedby="describedBy('endDate', 'end-hint')"
              class="field-input mt-1.5"
            />
            <FieldError id="endDate-error" :messages="fieldErrors('endDate')" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
