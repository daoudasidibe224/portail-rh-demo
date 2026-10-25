import { createRouter, createWebHistory, type RouteRecordRaw, type RouterHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    // Route parente, pour le fil d'Ariane.
    parent?: string
    // Entrée du menu principal à marquer comme active.
    section?: 'home' | 'telework' | 'news' | 'team'
  }
}

const APP_NAME = 'Portail RH'

export const documentTitle = (title: string) => `${title} – ${APP_NAME}`

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Accueil', section: 'home' } },
  {
    path: '/teletravail',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Mon télétravail', parent: 'home', section: 'telework' },
  },
  {
    path: '/teletravail/charte',
    name: 'charter',
    component: () => import('@/views/CharterView.vue'),
    meta: { title: 'Charte du télétravail', parent: 'dashboard', section: 'telework' },
  },
  {
    path: '/demandes/nouvelle',
    name: 'new-request',
    component: () => import('@/views/NewRequestView.vue'),
    meta: { title: 'Nouvelle demande de télétravail', parent: 'dashboard', section: 'telework' },
  },
  {
    path: '/demandes/:id',
    name: 'request',
    component: () => import('@/views/RequestDetailView.vue'),
    props: true,
    meta: { title: 'Détail de la demande', parent: 'dashboard', section: 'telework' },
  },
  {
    path: '/equipe',
    name: 'team',
    component: () => import('@/views/TeamView.vue'),
    meta: { title: 'Mon équipe', parent: 'home', section: 'team' },
  },
  {
    path: '/actualites',
    name: 'news',
    component: () => import('@/views/NewsListView.vue'),
    meta: { title: 'Actualités RH', parent: 'home', section: 'news' },
  },
  {
    path: '/actualites/:slug',
    name: 'news-article',
    component: () => import('@/views/NewsArticleView.vue'),
    props: true,
    meta: { title: 'Actualité', parent: 'news', section: 'news' },
  },
  {
    path: '/annuaire',
    name: 'directory',
    component: () => import('@/views/DirectoryView.vue'),
    meta: { title: 'Annuaire', parent: 'home' },
  },
  {
    path: '/services/:service',
    name: 'service',
    component: () => import('@/views/ServiceView.vue'),
    props: true,
    meta: { title: 'Service RH', parent: 'home' },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { title: 'Contact', parent: 'home' },
  },
  {
    path: '/plan-du-site',
    name: 'sitemap',
    component: () => import('@/views/SitemapView.vue'),
    meta: { title: 'Plan du site', parent: 'home' },
  },
  {
    path: '/mentions-legales',
    name: 'legal',
    component: () => import('@/views/LegalView.vue'),
    meta: { title: 'Mentions légales', parent: 'home' },
  },
  {
    path: '/accessibilite',
    name: 'accessibility',
    component: () => import('@/views/AccessibilityView.vue'),
    meta: { title: 'Déclaration d’accessibilité', parent: 'home' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page introuvable' },
  },
]

function createAppRouter(history: RouterHistory = createWebHistory(import.meta.env.BASE_URL)) {
  const router = createRouter({
    history,
    routes,
    scrollBehavior(to, _from, saved) {
      if (saved) return saved
      if (to.hash) return { el: to.hash }
      return { top: 0 }
    },
  })

  router.afterEach((to) => {
    document.title = documentTitle(to.meta.title)
  })

  return router
}

export default createAppRouter()
