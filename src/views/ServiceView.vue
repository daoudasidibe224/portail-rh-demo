<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { computed } from 'vue'

import HrContact from '@/components/home/HrContact.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { usePageTitle } from '@/composables/usePageTitle'
import { serviceBySlug } from '@/lib/services'

const props = defineProps<{ service: string }>()
const heading = usePageHeading()

const found = computed(() => serviceBySlug(props.service))

usePageTitle(() => found.value?.label ?? 'Service introuvable')
</script>

<template>
  <div class="space-y-6">
    <header>
      <PageTitle ref="heading">{{ found?.label ?? 'Service introuvable' }}</PageTitle>
      <p v-if="found" class="mt-1 max-w-prose text-ink-600">{{ found.description }}.</p>
    </header>

    <template v-if="found">
      <p
        v-if="!found.to"
        class="flex max-w-prose items-start gap-2.5 rounded-xl border border-info-700/30 bg-info-50 px-4 py-3 text-sm text-info-700"
      >
        <Info class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span
          >Ce service est en démonstration : il n’est pas encore branché dans ce prototype.</span
        >
      </p>
      <AppButton v-if="found.to" :to="found.to" size="lg">
        Ouvrir {{ found.label.toLowerCase() }}
      </AppButton>
      <AppButton v-else to="/" variant="secondary">Retour à l’accueil</AppButton>
    </template>

    <template v-else>
      <p class="max-w-prose text-ink-600">
        Ce service n’existe pas. Retournez à l’accueil pour voir la liste des services RH.
      </p>
      <AppButton to="/" size="lg">Retour à l’accueil</AppButton>
    </template>

    <HrContact />
  </div>
</template>
