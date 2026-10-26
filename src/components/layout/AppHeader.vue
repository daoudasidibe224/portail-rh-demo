<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { fullName } from '@/lib/types'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const route = useRoute()
const pendingCount = computed(() => portal.teamPending.length)

type Section = NonNullable<typeof route.meta.section>

const links = computed<{ to: string; label: string; short?: string; section: Section }[]>(() => [
  { to: '/', label: 'Accueil', section: 'home' },
  { to: '/teletravail', label: 'Mon télétravail', short: 'Télétravail', section: 'telework' },
  { to: '/actualites', label: 'Actualités RH', short: 'Actualités', section: 'news' },
  ...(portal.teamMembers.length
    ? [{ to: '/equipe', label: 'Mon équipe', short: 'Équipe', section: 'team' as const }]
    : []),
])

/** `page` sur la page exacte, `true` quand seule la rubrique correspond (ex. la charte). */
function currentState(link: { to: string; section: Section }): 'page' | 'true' | undefined {
  if (route.path === link.to) return 'page'
  return route.meta.section === link.section ? 'true' : undefined
}
</script>

<template>
  <header class="bg-black text-white print:hidden">
    <div
      class="mx-auto flex max-w-6xl flex-wrap items-stretch justify-between gap-x-8 px-4 sm:px-6 md:flex-nowrap"
    >
      <RouterLink to="/" class="flex min-h-14 items-center gap-2.5">
        <span class="block size-3.5 bg-brand-600" aria-hidden="true" />
        <span class="text-[1.0625rem] font-semibold">Portail RH</span>
      </RouterLink>

      <p class="flex min-h-14 items-center text-sm text-ink-200 md:order-last">
        <span class="sr-only">Connecté en tant que </span>{{ fullName(portal.currentUser) }}
      </p>

      <nav
        id="navigation"
        aria-label="Navigation principale"
        tabindex="-1"
        class="-mx-4 w-[calc(100%+2rem)] border-t border-white/15 sm:-mx-6 sm:w-[calc(100%+3rem)] md:mx-0 md:w-auto md:flex-1 md:border-0"
      >
        <ul class="relative flex h-full overflow-x-auto px-1 sm:px-3 md:px-0">
          <li v-for="link in links" :key="link.to">
            <RouterLink v-slot="{ href, navigate }" :to="link.to" custom>
              <a
                :href="href"
                :aria-current="currentState(link)"
                class="flex h-full min-h-12 items-center gap-2 border-b-[3px] px-2 text-sm min-[360px]:px-2.5 whitespace-nowrap sm:px-3"
                :class="
                  currentState(link)
                    ? 'border-brand-600 font-semibold text-white'
                    : 'border-transparent text-ink-200 hover:text-white'
                "
                @click="navigate"
              >
                <span class="max-sm:hidden">{{ link.label }}</span>
                <span class="sm:hidden">{{ link.short ?? link.label }}</span>
                <span
                  v-if="link.to === '/equipe' && pendingCount"
                  class="bg-brand-600 px-1.5 text-xs leading-5 font-semibold text-white"
                >
                  <span aria-hidden="true">{{ pendingCount }}</span>
                  <span class="sr-only"
                    >{{ pendingCount }} {{ pendingCount > 1 ? 'demandes' : 'demande' }} à
                    valider</span
                  >
                </span>
              </a>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
