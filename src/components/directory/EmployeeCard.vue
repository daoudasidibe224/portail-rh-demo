<script setup lang="ts">
import { Mail } from 'lucide-vue-next'

import { directoryEmail } from '@/domain/directory'
import { fullName, initials, type Employee } from '@/domain/types'

defineProps<{ employee: Employee; manager?: Employee }>()
</script>

<template>
  <article class="card p-4 sm:p-5">
    <div class="flex items-center gap-3">
      <span
        class="grid size-11 shrink-0 place-items-center rounded-full bg-ink-100 text-sm font-semibold text-ink-700"
        aria-hidden="true"
      >
        {{ initials(employee) }}
      </span>
      <div class="min-w-0 flex-1">
        <h2 class="text-lg leading-snug font-semibold [overflow-wrap:anywhere] text-ink-900">
          {{ fullName(employee) }}
        </h2>
        <p class="text-ink-700 [overflow-wrap:anywhere]">{{ employee.jobTitle }}</p>
      </div>
    </div>
    <!-- Pleine largeur : une adresse e-mail longue tient sur une ligne. -->
    <dl class="mt-3 space-y-1 border-t border-ink-200 pt-3 text-sm">
      <div class="flex items-baseline gap-3">
        <dt class="w-[4.5rem] shrink-0 text-ink-600">Équipe</dt>
        <dd class="min-w-0 font-medium text-ink-900 [overflow-wrap:anywhere]">
          {{ employee.team }}
        </dd>
      </div>
      <div v-if="manager" class="flex items-baseline gap-3">
        <dt class="w-[4.5rem] shrink-0 text-ink-600">Manager</dt>
        <dd class="min-w-0 font-medium text-ink-900 [overflow-wrap:anywhere]">
          {{ fullName(manager) }}
        </dd>
      </div>
      <div class="flex items-center gap-3">
        <dt class="w-[4.5rem] shrink-0 text-ink-600">E-mail</dt>
        <dd class="min-w-0">
          <a
            :href="`mailto:${directoryEmail(employee)}`"
            class="-my-2 inline-flex min-h-10 items-center gap-1.5 font-medium text-ink-900 underline underline-offset-2 [overflow-wrap:anywhere] hover:text-brand-700 active:text-brand-800"
          >
            <Mail class="size-4 shrink-0" aria-hidden="true" />
            {{ directoryEmail(employee) }}
          </a>
        </dd>
      </div>
    </dl>
  </article>
</template>
