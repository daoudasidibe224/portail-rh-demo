<script setup lang="ts">
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { CONTACT } from '@/lib/contact'

const heading = usePageHeading()
</script>

<template>
  <article class="max-w-prose space-y-8 text-ink-900">
    <PageTitle ref="heading">Mentions légales</PageTitle>

    <section aria-labelledby="publisher-title" class="space-y-2">
      <h2 id="publisher-title" class="text-xl font-semibold">Éditeur</h2>
      <p>
        Portail RH, projet de démonstration. Ce site ne représente aucune entreprise réelle et ne
        propose aucun service en production.
      </p>
    </section>

    <section aria-labelledby="hosting-title" class="space-y-2">
      <h2 id="hosting-title" class="text-xl font-semibold">Hébergement</h2>
      <p>
        L’application n’a pas de serveur : elle est servie en local et tourne entièrement dans votre
        navigateur.
      </p>
    </section>

    <section aria-labelledby="data-title" class="space-y-2">
      <h2 id="data-title" class="text-xl font-semibold">Données personnelles</h2>
      <p>
        Les collaborateurs, les demandes et les messages affichés sont fictifs. Ce que vous
        saisissez reste dans le <code class="font-mono text-sm">localStorage</code> de votre
        navigateur : rien n’est envoyé ailleurs.
      </p>
      <p>
        Pour tout effacer, utilisez « Réinitialiser la démo » dans le pied de page. Vous pouvez
        aussi vider les données du site depuis les réglages de votre navigateur.
      </p>
    </section>

    <section aria-labelledby="contact-title" class="space-y-2">
      <h2 id="contact-title" class="text-xl font-semibold">Contact</h2>
      <p>
        Une question sur ce projet ? Écrivez à
        <a
          :href="`mailto:${CONTACT.email}`"
          class="font-medium underline underline-offset-2 hover:text-brand-700"
          >{{ CONTACT.email }}</a
        >.
      </p>
    </section>
  </article>
</template>
