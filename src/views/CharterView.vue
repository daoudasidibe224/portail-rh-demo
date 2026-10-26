<script setup lang="ts">
import { CircleCheck, FileCheck } from 'lucide-vue-next'
import { nextTick, ref } from 'vue'

import CharterContent from '@/components/request/CharterContent.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/lib/dateFormat'
import { RULES } from '@/lib/rules'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const heading = usePageHeading()
const { show } = useToast()

const statusBlock = ref<HTMLElement | null>(null)

/* Le bouton disparaît une fois la charte acceptée : le focus passe sur le statut. */
async function accept() {
  portal.acceptCharter()
  show(`Charte ${RULES.charterVersion} acceptée`, {
    description: 'Elle ne vous sera plus demandée pour vos prochaines demandes.',
  })
  await nextTick()
  statusBlock.value?.focus()
}
</script>

<template>
  <article class="max-w-3xl space-y-6">
    <header>
      <PageTitle ref="heading">Charte télétravail</PageTitle>
      <p class="mt-1 text-ink-600">Version {{ RULES.charterVersion }}</p>
      <p class="mt-1 text-sm text-ink-600">
        La version {{ RULES.previousCharterVersion }} n’est plus en vigueur : seule la version
        {{ RULES.charterVersion }} s’applique.
      </p>
    </header>

    <div
      ref="statusBlock"
      tabindex="-1"
      class="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <p
        v-if="portal.charterAccepted && portal.currentUser.charterAcceptedAt"
        class="flex items-start gap-2 text-ink-900"
      >
        <CircleCheck class="mt-0.5 size-5 shrink-0 text-success-700" aria-hidden="true" />
        <span>
          <strong class="font-semibold">Acceptée le</strong>
          {{ formatDateTime(portal.currentUser.charterAcceptedAt) }}
        </span>
      </p>
      <template v-else>
        <p class="text-ink-900">
          <strong class="font-semibold">Pas encore acceptée.</strong>
          <template v-if="portal.currentUser.charterAcceptedVersion">
            Vous aviez accepté la version {{ portal.currentUser.charterAcceptedVersion }}.
          </template>
          Vous devez l’accepter une fois pour demander du télétravail.
        </p>
        <AppButton class="shrink-0" size="lg" @click="accept">
          <FileCheck class="size-4" aria-hidden="true" />
          J’accepte la charte
        </AppButton>
      </template>
    </div>

    <section aria-labelledby="charter-rules-title" class="space-y-3">
      <h2 id="charter-rules-title" class="text-xl font-semibold text-ink-900">
        Les règles à connaître
      </h2>
      <div class="card p-4 sm:p-5">
        <CharterContent />
      </div>
    </section>
  </article>
</template>
