import { onMounted, onUnmounted, ref } from 'vue'

// Sans `matchMedia` (tests), la requête vaut vrai.
export function useMediaQuery(query: string) {
  const matches = ref(true)
  let list: MediaQueryList | undefined
  const update = () => {
    matches.value = list?.matches ?? true
  }
  onMounted(() => {
    if (typeof window.matchMedia !== 'function') return
    list = window.matchMedia(query)
    update()
    list.addEventListener('change', update)
  })
  onUnmounted(() => list?.removeEventListener('change', update))
  return matches
}
