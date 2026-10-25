<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'

const heading = usePageHeading()
</script>

<template>
  <div class="max-w-prose space-y-6 py-4">
    <div>
      <PageTitle ref="heading">Page introuvable</PageTitle>
      <p class="mt-1 text-ink-700">
        Le lien est peut-être incomplet, ou la demande n’existe plus. Le plan du site liste toutes
        les pages du portail.
      </p>
    </div>
    <div class="flex flex-col gap-3 sm:flex-row">
      <AppButton to="/">Retour à l’accueil</AppButton>
      <AppButton to="/plan-du-site" variant="secondary">Voir le plan du site</AppButton>
    </div>
  </div>
</template>
