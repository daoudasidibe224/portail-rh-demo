<script setup lang="ts">
import { CircleCheck } from 'lucide-vue-next'
import { ref } from 'vue'

import { usePreferencesStore } from '@/stores/preferences'

const preferences = usePreferencesStore()

// Zone de statut présente dès l'affichage : le texte inséré ensuite est annoncé.
const message = ref('')

function onChange(event: Event) {
  const subscribed = (event.target as HTMLInputElement).checked
  preferences.setNewsletter(subscribed)
  const base = subscribed
    ? 'Inscription enregistrée. Vous recevrez la lettre RH mensuelle.'
    : 'Désinscription enregistrée. Vous ne recevrez plus la lettre RH.'
  message.value = preferences.persistenceError
    ? `${base} Votre navigateur ne peut pas la conserver : le choix vaut pour cette session seulement.`
    : base
}
</script>

<template>
  <section aria-labelledby="newsletter-title" class="card px-4 py-4 sm:px-5">
    <h2 id="newsletter-title" class="text-xl font-semibold text-ink-900">Lettre RH</h2>
    <label class="mt-2 flex min-h-10 cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        class="mt-2.5 size-5 shrink-0 accent-ink-900"
        aria-describedby="newsletter-help"
        :checked="preferences.newsletter"
        @change="onChange"
      />
      <span class="py-2 font-medium text-ink-900">Recevoir la lettre RH mensuelle</span>
    </label>
    <p id="newsletter-help" class="pl-8 text-sm text-ink-600">
      Facultatif. Un message par mois avec les actualités RH. Vous pouvez changer d’avis ici à tout
      moment.
    </p>
    <!-- Zone de statut vide tant qu'aucun choix n'est fait. -->
    <div role="status">
      <p v-if="message" class="mt-3 flex items-start gap-2 text-sm text-success-700">
        <CircleCheck class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{{ message }}</span>
      </p>
    </div>
  </section>
</template>
