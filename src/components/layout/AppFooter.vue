<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { CONTACT } from '@/lib/contact'
import pkg from '../../../package.json'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const drafts = useDraftStore()
const router = useRouter()
const { show } = useToast()
const confirmReset = ref(false)
const year = new Date().getFullYear()
const { version } = pkg

const links = [
  { to: '/contact', label: 'Contact' },
  { to: '/plan-du-site', label: 'Plan du site' },
  { to: '/mentions-legales', label: 'Mentions légales' },
  { to: '/accessibilite', label: 'Accessibilité : partiellement conforme' },
]

function reset() {
  portal.resetDemo()
  drafts.reset()
  show('Données de démonstration réinitialisées', { tone: 'info' })
  router.push('/')
}
</script>

<template>
  <footer class="mt-16 border-t border-ink-200 bg-white print:hidden">
    <div class="mx-auto max-w-6xl space-y-4 px-4 py-6 text-sm text-ink-600 sm:px-6">
      <p>
        Une question ? Équipe RH :
        <a
          :href="`mailto:${CONTACT.email}`"
          class="font-medium text-ink-900 underline underline-offset-2"
          >{{ CONTACT.email }}</a
        >
        ou {{ CONTACT.phone }}, {{ CONTACT.hours }}.
      </p>
      <div class="flex flex-wrap items-center gap-x-5 gap-y-1">
        <nav aria-label="Informations légales et aide">
          <ul class="flex flex-wrap items-center gap-x-5 gap-y-1">
            <li v-for="link in links" :key="link.to">
              <RouterLink
                :to="link.to"
                class="inline-flex min-h-10 items-center underline underline-offset-2 hover:text-ink-900"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>
        <button
          type="button"
          class="inline-flex min-h-10 items-center underline underline-offset-2 hover:text-ink-900"
          @click="confirmReset = true"
        >
          Réinitialiser la démo
        </button>
      </div>
      <p>© {{ year }} Portail RH, projet de démonstration · version {{ version }}</p>
    </div>
    <ConfirmDialog
      v-model:open="confirmReset"
      title="Réinitialiser les données de démonstration ?"
      description="Vos demandes, décisions et brouillons enregistrés dans ce navigateur seront remplacés par le jeu de démonstration."
      confirm-label="Réinitialiser"
      tone="danger"
      @confirm="reset"
    />
  </footer>
</template>
