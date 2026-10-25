<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { computed } from 'vue'

import HrContact from '@/components/home/HrContact.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { usePageTitle } from '@/composables/usePageTitle'
import { serviceContent } from '@/domain/serviceContent'
import { serviceBySlug } from '@/domain/services'
import { usePortalStore } from '@/stores/portal'

const props = defineProps<{ service: string }>()
const heading = usePageHeading()
const portal = usePortalStore()

const found = computed(() => serviceBySlug(props.service))
const content = computed(() => serviceContent(props.service, portal.today))

usePageTitle(() => found.value?.label ?? 'Service introuvable')
</script>

<template>
  <div class="space-y-6">
    <header>
      <PageTitle ref="heading">{{ found?.label ?? 'Service introuvable' }}</PageTitle>
      <p v-if="found" class="mt-1 max-w-prose text-ink-600">{{ found.description }}.</p>
    </header>

    <template v-if="found && found.to">
      <AppButton :to="found.to" size="lg">Ouvrir {{ found.label.toLowerCase() }}</AppButton>
    </template>

    <template v-else-if="found && content">
      <p
        class="flex max-w-prose items-start gap-2.5 rounded-xl border border-info-700/30 bg-info-50 px-4 py-3 text-sm text-info-700"
      >
        <Info class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Données de démonstration. Ce service n’est pas branché à une vraie source : dans le
          portail réel, il permettra de {{ content.later }}.
        </span>
      </p>

      <!-- Deux tuiles par ligne sur téléphone ; la dernière prend toute la largeur si elle est seule. -->
      <dl
        v-if="content.tiles.length"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 max-sm:[&>:last-child:nth-child(odd)]:col-span-2"
      >
        <div
          v-for="tile in content.tiles"
          :key="tile.label"
          class="card min-w-0 px-4 py-3 sm:px-5 sm:py-4"
        >
          <dt class="text-sm text-ink-600">{{ tile.label }}</dt>
          <dd class="mt-1 text-ink-900">
            <strong class="text-2xl font-semibold [overflow-wrap:anywhere]">{{
              tile.value
            }}</strong>
            <span v-if="tile.hint" class="block text-sm text-ink-600">{{ tile.hint }}</span>
          </dd>
        </div>
      </dl>

      <section aria-labelledby="service-list-title" class="space-y-3">
        <h2 id="service-list-title" class="text-xl font-semibold text-ink-900">
          {{ content.listTitle }}
        </h2>
        <ul class="card divide-y divide-ink-200 overflow-hidden">
          <li
            v-for="row in content.rows"
            :key="row.title"
            class="flex flex-col gap-x-4 gap-y-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:px-5"
          >
            <div class="min-w-0">
              <p class="font-medium text-ink-900">{{ row.title }}</p>
              <p class="text-sm text-ink-600">{{ row.meta }}</p>
            </div>
            <p v-if="row.status" class="text-sm font-medium text-ink-700 sm:text-right">
              {{ row.status }}
            </p>
          </li>
        </ul>
      </section>

      <AppButton to="/" variant="secondary">Retour à l’accueil</AppButton>
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
