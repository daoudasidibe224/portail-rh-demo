<script setup lang="ts">
import { formatFull } from '@/domain/dates'
import { NEWS_CATEGORIES } from '@/domain/news'
import type { NewsArticle } from '@/domain/types'

defineProps<{ article: Pick<NewsArticle, 'publishedAt' | 'category'> }>()
</script>

<template>
  <p class="flex flex-wrap items-center gap-x-2 text-sm text-ink-600">
    <time :datetime="article.publishedAt">{{ formatFull(article.publishedAt) }}</time>
    <span aria-hidden="true">·</span>
    <span><span class="sr-only">Catégorie : </span>{{ NEWS_CATEGORIES[article.category] }}</span>
  </p>
</template>
