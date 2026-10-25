<script setup lang="ts">
import AppPagination from '@/components/ui/AppPagination.vue'

import type { Pager } from './pager'

defineProps<{ pager: Pager; label: string }>()
</script>

<template>
  <AppPagination
    :page="pager.page.value"
    :page-count="pager.pageCount.value"
    :from="pager.from.value"
    :to="pager.to.value"
    :total="pager.total.value"
    :label="label"
    @update:page="pager.go"
  />
</template>
