<script setup lang="ts">
import NewsListItem from '@/components/news/NewsListItem.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { NEWS } from '@/lib/news'

const heading = usePageHeading()
</script>

<template>
  <div class="space-y-6">
    <PageTitle ref="heading">Actualités RH</PageTitle>

    <ul v-if="NEWS.length" class="card divide-y divide-ink-200 overflow-hidden">
      <NewsListItem v-for="article in NEWS" :key="article.slug" :article="article" />
    </ul>
    <EmptyState v-else class="card" title="Aucune actualité pour le moment.">
      Les prochaines annonces RH apparaîtront ici dès leur publication.
    </EmptyState>
  </div>
</template>
