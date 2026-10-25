<script setup lang="ts">
import { CircleCheck } from 'lucide-vue-next'
import { ref } from 'vue'

import CharterDialog from '@/components/request/CharterDialog.vue'
import FieldError from '@/components/request/FieldError.vue'
import { useRequestTarget } from '@/composables/useRequestTarget'
import { formatDateTime } from '@/domain/dateFormat'
import { RULES } from '@/domain/rules'
import type { ValidationError } from '@/domain/validation'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

import { ANCHORS as anchors, useFieldState } from './anchors'

const props = defineProps<{ errors: readonly ValidationError[] }>()
// Appliquée à l'envoi seulement : abandonner la demande ne change pas l'abonnement.
const newsletter = defineModel<boolean>('newsletter', { required: true })

const portal = usePortalStore()
const drafts = useDraftStore()
const { fieldErrors, invalid, describedBy } = useFieldState(() => props.errors)
const { forOther } = useRequestTarget()
const charterOpen = ref(false)
</script>

<template>
  <section class="space-y-4 print:hidden" aria-labelledby="commitments-title">
    <h3 id="commitments-title" class="text-base font-semibold text-ink-900">Engagements</h3>

    <div v-if="!forOther" :id="anchors.charter">
      <div
        v-if="portal.charterAccepted"
        class="text-sm text-ink-700 sm:flex sm:flex-wrap sm:items-center sm:gap-x-2"
      >
        <p class="flex items-start gap-2">
          <CircleCheck class="mt-0.5 size-4 shrink-0 text-success-700" aria-hidden="true" />
          <span>
            Charte du télétravail {{ RULES.charterVersion }} acceptée le
            {{ formatDateTime(portal.currentUser.charterAcceptedAt!) }}.
          </span>
        </p>
        <button
          type="button"
          class="mt-1 ml-6 inline-flex min-h-10 items-center font-semibold underline underline-offset-2 sm:mt-0 sm:ml-0"
          @click="charterOpen = true"
        >
          La relire
        </button>
      </div>
      <template v-else>
        <label for="charter-checkbox" class="flex min-h-10 cursor-pointer items-start gap-3">
          <input
            id="charter-checkbox"
            v-model="drafts.draft.charterAccepted"
            type="checkbox"
            class="check mt-2.5 shrink-0"
            aria-required="true"
            :aria-invalid="invalid('charter') || undefined"
            :aria-describedby="describedBy('charter')"
          />
          <span class="py-2 text-sm text-ink-900">
            J’ai lu et j’accepte la charte du télétravail ({{ RULES.charterVersion }}). Je ne la
            reverrai plus pour mes prochaines demandes.
          </span>
        </label>
        <button
          type="button"
          class="ml-8 inline-flex min-h-10 items-center text-sm font-semibold underline underline-offset-2"
          @click="charterOpen = true"
        >
          Lire la charte
        </button>
        <FieldError id="charter-error" :messages="fieldErrors('charter')" />
      </template>
    </div>

    <div :id="anchors.connection">
      <label for="connection-checkbox" class="flex min-h-10 cursor-pointer items-start gap-3">
        <input
          id="connection-checkbox"
          v-model="drafts.draft.connectionConfirmed"
          type="checkbox"
          class="check mt-2.5 shrink-0"
          aria-required="true"
          :aria-invalid="invalid('connection') || undefined"
          :aria-describedby="describedBy('connection')"
        />
        <span class="py-2 text-sm text-ink-900">
          {{
            forOther
              ? 'La personne dispose d’une connexion internet stable à son domicile.'
              : 'Je dispose d’une connexion internet stable à mon domicile.'
          }}
          <span class="text-ink-600">(obligatoire)</span>
        </span>
      </label>
      <FieldError id="connection-error" :messages="fieldErrors('connection')" />
    </div>

    <label class="flex min-h-10 cursor-pointer items-start gap-3">
      <input
        v-model="drafts.draft.recontactAllowed"
        type="checkbox"
        class="check mt-2.5 shrink-0"
      />
      <span class="py-2 text-sm text-ink-900">
        {{
          forOther
            ? 'La personne accepte que le service RH la recontacte au sujet de cette demande.'
            : 'J’accepte que le service RH me recontacte au sujet de cette demande.'
        }}
        <span class="text-ink-600">(facultatif)</span>
      </span>
    </label>

    <label v-if="!forOther" class="flex min-h-10 cursor-pointer items-start gap-3">
      <input v-model="newsletter" type="checkbox" class="check mt-2.5 shrink-0" />
      <span class="py-2 text-sm text-ink-900">
        Recevoir la lettre RH mensuelle.
        <span class="text-ink-600">(facultatif, modifiable dans les actualités)</span>
      </span>
    </label>
  </section>
  <CharterDialog v-model:open="charterOpen" />
</template>
