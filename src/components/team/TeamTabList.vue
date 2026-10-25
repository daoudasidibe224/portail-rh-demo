<script setup lang="ts">
import { TabsList, TabsTrigger } from 'reka-ui'
import { ref } from 'vue'

defineProps<{ pendingCount: number }>()

const pendingTab = ref<{ $el: HTMLElement } | null>(null)
defineExpose({ focusPending: () => pendingTab.value?.$el.focus() })
</script>

<template>
  <div class="border-b border-ink-200 px-4 py-3 sm:px-5 print:hidden">
    <TabsList aria-label="Vues de l’équipe" class="segmented max-sm:flex max-sm:w-full">
      <TabsTrigger
        ref="pendingTab"
        value="pending"
        class="segmented-item max-sm:flex-1 max-sm:justify-center max-sm:px-2"
      >
        À valider
        <span class="rounded-md bg-white px-1.5 text-sm font-semibold text-ink-900">
          {{ pendingCount }}
        </span>
      </TabsTrigger>
      <TabsTrigger
        aria-label="Présence de l’équipe"
        value="presence"
        class="segmented-item max-sm:flex-1 max-sm:justify-center max-sm:px-2"
      >
        Présence<span class="max-sm:hidden"> de l’équipe</span>
      </TabsTrigger>
    </TabsList>
  </div>
</template>
