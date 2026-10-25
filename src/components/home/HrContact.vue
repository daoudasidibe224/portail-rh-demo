<script setup lang="ts">
import { CONTACT } from '@/domain/contact'
</script>

<template>
  <section aria-labelledby="contact-title" class="card px-4 py-4 sm:px-5">
    <h2 id="contact-title" class="text-xl font-semibold text-ink-900">Contact RH</h2>
    <dl class="mt-2 space-y-1 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:space-y-0">
      <div class="flex items-baseline gap-3 sm:block">
        <dt class="w-20 shrink-0 text-sm text-ink-600 sm:w-auto">E-mail</dt>
        <dd>
          <a
            :href="`mailto:${CONTACT.email}`"
            class="link-action -my-2 inline-flex min-h-10 items-center active:text-brand-800"
            >{{ CONTACT.email }}</a
          >
        </dd>
      </div>
      <div class="flex items-baseline gap-3 sm:block">
        <dt class="w-20 shrink-0 text-sm text-ink-600 sm:w-auto">Téléphone</dt>
        <dd class="text-ink-900">{{ CONTACT.phone }}</dd>
      </div>
      <div class="flex items-baseline gap-3 sm:block">
        <dt class="w-20 shrink-0 text-sm text-ink-600 sm:w-auto">Horaires</dt>
        <dd class="text-ink-900">{{ CONTACT.hours }}</dd>
      </div>
    </dl>
  </section>
</template>
