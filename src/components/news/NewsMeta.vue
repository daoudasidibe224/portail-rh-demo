<script setup lang="ts">
import { formatFull } from '@/lib/dateFormat'
import { NEWS_CATEGORIES } from '@/lib/news'
import type { NewsArticle } from '@/lib/types'

defineProps<{ article: Pick<NewsArticle, 'publishedAt' | 'category'> }>()
</script>

<template>
  <p class="flex flex-wrap items-center gap-x-4 text-sm text-ink-600">
    <time :datetime="article.publishedAt">{{ formatFull(article.publishedAt) }}</time>
    <span><span class="sr-only">Catégorie : </span>{{ NEWS_CATEGORIES[article.category] }}</span>
  </p>
</template>
