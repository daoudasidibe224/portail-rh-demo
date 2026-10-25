import { computed, ref, watch, type Ref } from 'vue'

// Si la liste rétrécit et vide la dernière page, on revient à la précédente.
export function usePagination<T>(items: Ref<readonly T[]>, pageSize: number) {
  const page = ref(1)
  const total = computed(() => items.value.length)
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

  watch(pageCount, (count) => {
    if (page.value > count) page.value = count
  })

  const visible = computed(() =>
    items.value.slice((page.value - 1) * pageSize, page.value * pageSize),
  )
  const from = computed(() => (total.value ? (page.value - 1) * pageSize + 1 : 0))
  const to = computed(() => Math.min(page.value * pageSize, total.value))

  function go(next: number) {
    page.value = Math.min(Math.max(1, next), pageCount.value)
  }

  return { page, pageCount, total, visible, from, to, go }
}
