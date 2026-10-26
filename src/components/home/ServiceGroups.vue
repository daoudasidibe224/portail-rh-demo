<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { servicePath, servicesByGroup } from '@/lib/services'

// Libellés seuls : la description est sur la page du service.
const groups = servicesByGroup()

const linkClass = 'link-quiet inline-flex min-h-10 items-center text-ink-900 active:text-ink-700'
</script>

<template>
  <div class="card gap-x-8 px-4 pt-4 sm:columns-2 sm:px-5">
    <div v-for="group in groups" :key="group.group" class="break-inside-avoid pb-4">
      <h3 class="text-sm font-semibold text-ink-600">{{ group.label }}</h3>
      <ul class="mt-1">
        <li v-for="service in group.services" :key="service.slug">
          <RouterLink :to="servicePath(service)" :class="linkClass">
            {{ service.label }}
          </RouterLink>
        </li>
      </ul>
    </div>
    <div class="break-inside-avoid pb-4">
      <h3 class="text-sm font-semibold text-ink-600">Contacts</h3>
      <ul class="mt-1">
        <li>
          <RouterLink to="/annuaire" :class="linkClass">Annuaire</RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
