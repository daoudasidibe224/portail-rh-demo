<script setup lang="ts">
import { RouterLink } from 'vue-router'

import NewsMeta from '@/components/news/NewsMeta.vue'
import type { NewsArticle } from '@/lib/types'

/** `compact` : titre et date seulement, pour l'accueil. */
withDefaults(defineProps<{ article: NewsArticle; level?: 2 | 3; compact?: boolean }>(), {
  level: 2,
  compact: false,
})
</script>

<template>
  <li
    class="group relative px-4 py-4 hover:bg-ink-50 active:bg-ink-100 has-focus-visible:outline-3 has-focus-visible:-outline-offset-3 has-focus-visible:outline-info-700 sm:px-5"
  >
    <NewsMeta :article="article" />
    <component
      :is="`h${level}`"
      :class="['mt-1 font-semibold text-ink-900', compact ? 'text-base' : 'text-lg']"
    >
      <RouterLink
        :to="{ name: 'news-article', params: { slug: article.slug } }"
        class="underline-offset-2 focus-visible:outline-none group-hover:underline after:absolute after:inset-0"
      >
        {{ article.title }}
      </RouterLink>
    </component>
    <p v-if="!compact" class="mt-1 text-ink-700">{{ article.summary }}</p>
  </li>
</template>
