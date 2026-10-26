<script setup lang="ts">
import { computed } from 'vue'

import FieldError from '@/components/request/FieldError.vue'
import { fullName } from '@/lib/types'
import type { ValidationError } from '@/lib/validation'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

import { ANCHORS, useFieldState } from './anchors'

const props = defineProps<{ errors: readonly ValidationError[] }>()

const portal = usePortalStore()
const drafts = useDraftStore()
const { fieldErrors, invalid, describedBy } = useFieldState(() => props.errors)

const OTHER = '__other__'

const choices: { value: 'self' | 'team'; label: string }[] = [
  { value: 'self', label: 'Pour moi' },
  { value: 'team', label: 'Pour un membre de mon équipe' },
]

const who = computed(() => drafts.draft.onBehalf)

// Deux choix à l'écran : soi, ou un membre de l'équipe (ou une personne saisie à la main).
const choice = computed({
  get: () => (who.value.kind === 'self' ? 'self' : 'team'),
  set: (value: 'self' | 'team') => {
    resetPerson()
    who.value.kind = value === 'self' ? 'self' : 'member'
  },
})

const member = computed({
  get: () => (who.value.kind === 'other' ? OTHER : who.value.employeeId),
  set: (value: string) => {
    resetPerson()
    if (value === OTHER) who.value.kind = 'other'
    else {
      who.value.kind = 'member'
      who.value.employeeId = value
    }
  },
})

function resetPerson() {
  who.value.employeeId = ''
  who.value.matricule = ''
  who.value.firstName = ''
  who.value.lastName = ''
}
</script>

<template>
  <fieldset :id="ANCHORS.person" class="space-y-3" :aria-describedby="describedBy('person')">
    <legend class="field-label">Pour qui est cette demande ?</legend>
    <div class="flex flex-wrap gap-2">
      <label
        v-for="option in choices"
        :key="option.value"
        class="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 text-sm text-ink-900 hover:border-ink-400 has-checked:border-ink-900 has-checked:ring-1 has-checked:ring-ink-900"
      >
        <input
          v-model="choice"
          type="radio"
          name="on-behalf"
          :value="option.value"
          class="size-4 accent-ink-900"
        />
        {{ option.label }}
      </label>
    </div>

    <div v-if="choice === 'team'">
      <label for="member-select" class="field-label">Membre de l’équipe</label>
      <select
        id="member-select"
        v-model="member"
        :aria-invalid="invalid('person') || undefined"
        class="field-input mt-1.5"
      >
        <option value="" disabled>-- Sélectionner --</option>
        <option
          v-for="teamMember in portal.teamMembers"
          :key="teamMember.id"
          :value="teamMember.id"
        >
          {{ fullName(teamMember) }}, matricule {{ teamMember.matricule }}
        </option>
        <option :value="OTHER">Une autre personne, pas encore dans mon équipe</option>
      </select>
    </div>

    <div v-if="who.kind === 'other'" class="space-y-3">
      <div class="grid gap-3 sm:grid-cols-3">
        <div>
          <label for="who-matricule" class="field-label">Matricule</label>
          <input
            id="who-matricule"
            v-model="drafts.draft.onBehalf.matricule"
            type="text"
            inputmode="numeric"
            maxlength="8"
            autocomplete="off"
            aria-describedby="who-matricule-hint"
            :aria-invalid="invalid('person') || undefined"
            class="field-input mt-1.5"
          />
          <p id="who-matricule-hint" class="mt-0.5 text-sm text-ink-600">
            8 chiffres, commence par 00
          </p>
        </div>
        <div>
          <label for="who-first" class="field-label">Prénom</label>
          <input
            id="who-first"
            v-model="drafts.draft.onBehalf.firstName"
            type="text"
            autocomplete="off"
            class="field-input mt-1.5"
          />
        </div>
        <div>
          <label for="who-last" class="field-label">Nom</label>
          <input
            id="who-last"
            v-model="drafts.draft.onBehalf.lastName"
            type="text"
            autocomplete="off"
            class="field-input mt-1.5"
          />
        </div>
      </div>
      <p class="text-sm text-ink-600">
        La personne est ajoutée à votre équipe dans le portail, avec votre centre de coût.
      </p>
    </div>

    <p v-if="who.kind !== 'self'" class="text-sm text-ink-600">
      En tant que manager, votre saisie est validée tout de suite.
    </p>
    <FieldError id="person-error" :messages="fieldErrors('person')" />
  </fieldset>
</template>
