<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'solid' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    to?: RouteLocationRaw
    type?: 'button' | 'submit'
    block?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button', to: undefined, block: false },
)

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold press text-center text-balance',
  'disabled:cursor-not-allowed disabled:opacity-60',
  {
    sm: 'min-h-10 px-3 text-sm',
    md: 'min-h-11 px-4 text-sm',
    lg: 'min-h-12 px-5 text-base',
  }[props.size],
  {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:hover:bg-brand-600',
    secondary: 'border border-ink-900 bg-white text-ink-900 hover:bg-ink-100 active:bg-ink-200',
    solid: 'bg-ink-900 text-white hover:bg-ink-700 active:bg-black',
    ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200',
    danger: 'border border-brand-700 bg-white text-brand-700 hover:bg-brand-50 active:bg-brand-100',
  }[props.variant],
  props.block ? 'w-full' : '',
])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes"><slot /></RouterLink>
  <button v-else :type="type" :class="classes"><slot /></button>
</template>
