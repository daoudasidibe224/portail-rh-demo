<script setup lang="ts">
import { computed, h, type FunctionalComponent, type VNode } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { servicePath, servicesByGroup } from '@/lib/services'

interface SitemapNode {
  name: string
  title: string
  path: string
  children: SitemapNode[]
}

const heading = usePageHeading()
const router = useRouter()
const route = useRoute()

/** Pages statiques, rangées sous leur parent (`meta.parent`) dans l'ordre de déclaration. */
const tree = computed<SitemapNode[]>(() => {
  const declared = router.options.routes.map((r) => r.name)
  const pages = router
    .getRoutes()
    .filter((r) => typeof r.name === 'string' && r.name !== 'not-found' && !r.path.includes(':'))
    .sort((a, b) => declared.indexOf(a.name) - declared.indexOf(b.name))

  const nodes = new Map<string, SitemapNode>(
    pages.map((r) => [
      r.name as string,
      { name: r.name as string, title: r.meta.title, path: r.path, children: [] },
    ]),
  )
  const roots: SitemapNode[] = []
  for (const page of pages) {
    const node = nodes.get(page.name as string)!
    const parent = page.meta.parent ? nodes.get(page.meta.parent) : undefined
    ;(parent ? parent.children : roots).push(node)
  }
  return roots
})

const serviceGroups = servicesByGroup()

const linkClass =
  'inline-flex min-h-10 items-center text-ink-900 underline underline-offset-2 hover:text-brand-700 active:text-brand-800'

/* Liste imbriquée : composant fonctionnel local pour la récursion. */
const Branch: FunctionalComponent<{ nodes: SitemapNode[]; nested?: boolean }> = (props) =>
  h(
    'ul',
    { class: props.nested ? 'space-y-0.5 border-l border-ink-200 pl-5' : 'space-y-0.5' },
    props.nodes.map((node): VNode => {
      const isCurrent = route.name === node.name
      return h('li', { key: node.name }, [
        h(
          RouterLink,
          { to: node.path, class: linkClass, 'aria-current': isCurrent ? 'page' : undefined },
          () => node.title,
        ),
        node.children.length ? h(Branch, { nodes: node.children, nested: true }) : null,
      ])
    }),
  )
Branch.props = ['nodes', 'nested']
</script>

<template>
  <div class="space-y-6">
    <header>
      <PageTitle ref="heading">Plan du site</PageTitle>
      <p class="mt-1 text-ink-600">
        Toutes les pages du portail, de la plus générale à la plus précise.
      </p>
    </header>
    <div class="grid items-start gap-6 lg:grid-cols-2">
      <section aria-labelledby="pages-title" class="card px-4 py-4 sm:px-5">
        <h2 id="pages-title" class="text-xl font-semibold text-ink-900">Pages du portail</h2>
        <div class="mt-2">
          <Branch :nodes="tree" />
        </div>
      </section>
      <section aria-labelledby="services-title" class="card px-4 py-4 sm:px-5">
        <h2 id="services-title" class="text-xl font-semibold text-ink-900">Services RH</h2>
        <div class="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div v-for="item in serviceGroups" :key="item.group">
            <h3 class="text-sm font-semibold text-ink-600">{{ item.label }}</h3>
            <ul class="mt-1 space-y-0.5">
              <li v-for="service in item.services" :key="service.slug">
                <RouterLink :to="servicePath(service)" :class="linkClass">{{
                  service.label
                }}</RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
