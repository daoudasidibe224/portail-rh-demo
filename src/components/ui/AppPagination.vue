<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  page: number
  pageCount: number
  from: number
  to: number
  total: number
  /** Nom de la liste, repris dans le nom accessible : « Pagination des demandes ». */
  label: string
}>()
const emit = defineEmits<{ 'update:page': [page: number] }>()

// aria-disabled garde le focus aux extrémités.
function go(next: number) {
  if (next < 1 || next > props.pageCount) return
  emit('update:page', next)
}

const buttonClass =
  'press inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-ink-400 bg-white px-3 text-sm font-semibold text-ink-900 hover:bg-ink-100 active:bg-ink-200 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:bg-white'
</script>

<template>
  <!-- Téléphone : deux lignes. -->
  <nav
    v-if="pageCount > 1"
    :aria-label="`Pagination ${label}`"
    class="grid grid-cols-2 items-center gap-x-2 gap-y-3 border-t border-ink-200 px-4 py-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-3 sm:px-5 print:hidden"
  >
    <p class="order-1 text-sm text-ink-700 sm:order-none">{{ from }} à {{ to }} sur {{ total }}</p>
    <div class="contents sm:flex sm:items-center sm:gap-2">
      <button
        type="button"
        :class="buttonClass"
        class="order-3 sm:order-none"
        :aria-disabled="page <= 1"
        @click="go(page - 1)"
      >
        <ChevronLeft class="size-4" aria-hidden="true" />
        Précédent
      </button>
      <p
        class="order-2 text-right text-sm font-medium text-ink-900 sm:order-none sm:min-w-24 sm:text-center"
        role="status"
      >
        Page {{ page }} sur {{ pageCount }}
      </p>
      <button
        type="button"
        :class="buttonClass"
        class="order-4 sm:order-none"
        :aria-disabled="page >= pageCount"
        @click="go(page + 1)"
      >
        Suivant
        <ChevronRight class="size-4" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>
