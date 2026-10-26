<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next'
import { ref } from 'vue'

import AppButton from '@/components/ui/AppButton.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { plural } from '@/lib/format'

defineProps<{ memberCount: number; pendingCount: number }>()

const title = ref<{ focus: () => void } | null>(null)
defineExpose({ focus: () => title.value?.focus() })
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <PageTitle ref="title">Mon équipe</PageTitle>
      <p class="mt-1 text-ink-700">
        {{ memberCount }} {{ plural(memberCount, 'collaborateur') }}, {{ pendingCount }}
        {{ plural(pendingCount, 'demande') }} à valider
      </p>
    </div>
    <AppButton :to="{ name: 'new-request', query: { pour: 'membre' } }">
      <UserPlus class="size-4" aria-hidden="true" />
      Faire une demande pour un membre de l’équipe
    </AppButton>
  </div>
</template>
