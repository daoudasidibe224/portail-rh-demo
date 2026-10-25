<script setup lang="ts">
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { CONTACT } from '@/domain/contact'

const heading = usePageHeading()
</script>

<template>
  <article class="max-w-prose space-y-8 text-ink-900">
    <header class="space-y-3">
      <PageTitle ref="heading">Déclaration d’accessibilité</PageTitle>
      <p>
        Le Portail RH s’engage à rendre son service accessible conformément à l’article 47 de la loi
        n° 2005-102 du 11 février 2005, en suivant le Référentiel général d’amélioration de
        l’accessibilité (RGAA 4.1.2).
      </p>
    </header>

    <section aria-labelledby="status-title" class="space-y-2">
      <h2 id="status-title" class="text-xl font-semibold">État de conformité</h2>
      <p>
        Ce prototype est <strong>partiellement conforme</strong> au RGAA 4.1.2 : il a fait l’objet
        d’une auto-évaluation et de tests automatisés, mais pas encore d’un audit indépendant.
      </p>
    </section>

    <section aria-labelledby="tests-title" class="space-y-2">
      <h2 id="tests-title" class="text-xl font-semibold">Comment nous avons testé</h2>
      <ul class="list-disc space-y-1 pl-6">
        <li>
          axe-core (règles WCAG 2.2 A et AA) sur chaque écran, dans les tests de bout en bout.
        </li>
        <li>Parcours complet au clavier seul, sans souris.</li>
        <li>Contrastes des couleurs vérifiés automatiquement à partir des design tokens.</li>
        <li>Affichage à 320 px de large sans défilement horizontal.</li>
        <li>Lecteurs d’écran visés : NVDA avec Firefox, VoiceOver avec Safari.</li>
      </ul>
    </section>

    <section aria-labelledby="limits-title" class="space-y-2">
      <h2 id="limits-title" class="text-xl font-semibold">Limites connues</h2>
      <ul class="list-disc space-y-1 pl-6">
        <li>
          Le justificatif joint n’est pas transmis : seul son nom est conservé dans cette
          démonstration.
        </li>
      </ul>
    </section>

    <section aria-labelledby="contact-title" class="space-y-2">
      <h2 id="contact-title" class="text-xl font-semibold">Signaler un problème</h2>
      <p>
        Si vous ne parvenez pas à utiliser un contenu ou un service, écrivez à
        <a
          :href="`mailto:${CONTACT.accessibilityEmail}`"
          class="font-medium underline underline-offset-2 hover:text-brand-700"
          >{{ CONTACT.accessibilityEmail }}</a
        >. Vous pouvez aussi saisir le Défenseur des droits.
      </p>
    </section>
  </article>
</template>
