<script setup lang="ts">
import { REQUEST_TYPES } from '@/domain/rules'
import type { RequestType } from '@/domain/types'

const model = defineModel<RequestType>({ required: true })
const types = Object.keys(REQUEST_TYPES) as RequestType[]
</script>

<template>
  <fieldset>
    <legend class="text-lg font-semibold text-ink-900">Type de télétravail</legend>
    <div class="mt-3 grid gap-3 md:grid-cols-3">
      <label
        v-for="type in types"
        :key="type"
        class="relative flex cursor-pointer flex-col gap-1 rounded-lg border border-ink-200 bg-white p-4 transition-colors hover:border-ink-400 has-checked:border-ink-900 has-checked:ring-1 has-checked:ring-ink-900 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-info-700"
      >
        <span class="flex items-center gap-2">
          <input
            v-model="model"
            type="radio"
            name="request-type"
            :value="type"
            :aria-labelledby="`type-${type}-label`"
            :aria-describedby="`type-${type}-desc`"
            class="size-4 accent-ink-900"
          />
          <span :id="`type-${type}-label`" class="font-semibold text-ink-900">{{
            REQUEST_TYPES[type].label
          }}</span>
        </span>
        <span :id="`type-${type}-desc`" class="text-sm text-ink-700">
          {{ REQUEST_TYPES[type].description }}
          <span class="mt-1 block text-ink-600">{{ REQUEST_TYPES[type].rule }}</span>
        </span>
      </label>
    </div>
  </fieldset>
</template>
