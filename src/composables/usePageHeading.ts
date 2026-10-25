import { nextTick, onMounted, ref } from 'vue'

let firstRender = true

// Place le focus sur le h1 après une navigation, sauf au premier affichage.
export function usePageHeading() {
  const heading = ref<{ focus: () => void } | null>(null)
  onMounted(async () => {
    if (firstRender) {
      firstRender = false
      return
    }
    await nextTick()
    heading.value?.focus()
  })
  return heading
}
