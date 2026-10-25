<script setup lang="ts">
import { CloudOff } from 'lucide-vue-next'
import { RouterView } from 'vue-router'

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppNotice from '@/components/layout/AppNotice.vue'
import AppToaster from '@/components/ui/AppToaster.vue'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
</script>

<template>
  <AppToaster>
    <ul
      class="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-2 focus-within:left-2 focus-within:z-50 focus-within:flex focus-within:gap-2"
    >
      <li>
        <a href="#contenu" class="block rounded-lg bg-ink-900 px-4 py-3 font-semibold text-white">
          Aller au contenu
        </a>
      </li>
      <li>
        <a
          href="#navigation"
          class="block rounded-lg bg-ink-900 px-4 py-3 font-semibold text-white"
        >
          Aller à la navigation
        </a>
      </li>
    </ul>

    <div class="flex min-h-dvh flex-col">
      <AppHeader />
      <AppNotice />
      <p
        v-if="portal.persistenceError"
        role="alert"
        class="flex items-center justify-center gap-2 bg-warning-50 px-4 py-2 text-sm text-warning-700"
      >
        <CloudOff class="size-4" aria-hidden="true" />
        Enregistrement local impossible (navigation privée ou stockage plein) : vos modifications
        seront perdues à la fermeture.
      </p>
      <main id="contenu" tabindex="-1" class="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 sm:px-6">
        <AppBreadcrumb />
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </AppToaster>
</template>
