<script setup lang="ts">
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import NewsMeta from '@/components/news/NewsMeta.vue'
import AppButton from '@/components/ui/AppButton.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { usePageTitle } from '@/composables/usePageTitle'
import { newsBySlug } from '@/lib/news'

const props = defineProps<{ slug: string }>()
const heading = usePageHeading()

const article = computed(() => newsBySlug(props.slug))

usePageTitle(() => article.value?.title ?? 'Article introuvable')
</script>

<template>
  <article v-if="article" class="max-w-prose space-y-6">
    <header class="space-y-2">
      <PageTitle ref="heading">{{ article.title }}</PageTitle>
      <NewsMeta :article="article" />
    </header>

    <div class="space-y-4 text-lg leading-relaxed text-ink-900">
      <p v-for="(paragraph, index) in article.body" :key="index">{{ paragraph }}</p>
    </div>

    <AppButton v-if="article.link" variant="secondary" :to="article.link.to">
      {{ article.link.label }}
      <ArrowRight class="size-4" aria-hidden="true" />
    </AppButton>

    <p>
      <RouterLink to="/actualites" class="link-action inline-flex min-h-10 items-center gap-1.5">
        <ArrowLeft class="size-4" aria-hidden="true" />
        Toutes les actualités
      </RouterLink>
    </p>
  </article>

  <div v-else class="max-w-prose space-y-4">
    <PageTitle ref="heading">Article introuvable</PageTitle>
    <p class="text-ink-700">
      Cet article n’existe pas ou a été retiré. Retrouvez les autres dans la liste des actualités.
    </p>
    <AppButton variant="secondary" to="/actualites">Voir les actualités</AppButton>
  </div>
</template>
