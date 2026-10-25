<script setup lang="ts">
import { Mail } from 'lucide-vue-next'

import HrContact from '@/components/home/HrContact.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { CONTACT } from '@/domain/contact'

const heading = usePageHeading()
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <header>
      <PageTitle ref="heading">Contact</PageTitle>
      <p class="mt-1 text-ink-600">Une question sur une demande, votre solde ou la charte ?</p>
    </header>

    <HrContact />

    <section aria-labelledby="write-title" class="card space-y-3 px-4 py-4 sm:px-5">
      <h2 id="write-title" class="text-xl font-semibold text-ink-900">Écrire à l’équipe RH</h2>
      <p class="text-ink-700">
        Indiquez la référence de votre demande (par exemple TT-2026-00001) pour obtenir une réponse
        plus rapide.
      </p>
      <a
        :href="`mailto:${CONTACT.email}`"
        class="press inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 active:bg-brand-800"
      >
        <Mail class="size-4" aria-hidden="true" /> Envoyer un e-mail
      </a>
    </section>

    <p class="text-sm text-ink-600">
      Un problème d’accessibilité ? Écrivez à
      <a
        :href="`mailto:${CONTACT.accessibilityEmail}`"
        class="font-medium text-ink-900 underline underline-offset-2"
        >{{ CONTACT.accessibilityEmail }}</a
      >.
    </p>
  </div>
</template>
