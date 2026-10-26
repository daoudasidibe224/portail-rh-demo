import { RULES } from './rules'
import type { NewsArticle, NewsCategory } from './types'

export const NEWS_CATEGORIES: Record<NewsCategory, string> = {
  portail: 'Portail',
  teletravail: 'Télétravail',
  'vie-entreprise': 'Vie de l’entreprise',
  paie: 'Paie',
}

// Articles de démonstration, aux dates fixes.
const ARTICLES: NewsArticle[] = [
  {
    slug: 'nouveau-portail-rh',
    title: 'Le nouveau portail RH est en ligne',
    summary: 'Il remplace le formulaire TT-07b : vos demandes de télétravail se font ici.',
    publishedAt: '2026-10-20',
    category: 'portail',
    body: [
      'Le portail RH remplace le formulaire TT-07b. Vous faites vos demandes de télétravail directement en ligne.',
      'Vous y retrouvez vos demandes, votre solde et vos prochains jours à distance. Une demande d’un jour se fait en deux clics depuis l’accueil.',
      'Les actualités et les services RH sont regroupés sur la même page.',
    ],
    link: { label: 'Voir mon télétravail', to: '/teletravail' },
  },
  {
    slug: 'charte-teletravail',
    title: `La charte du télétravail ${RULES.charterVersion} remplace la ${RULES.previousCharterVersion}`,
    summary: 'Lisez la nouvelle version et acceptez-la sans passer par le formulaire de demande.',
    publishedAt: '2026-10-13',
    category: 'teletravail',
    body: [
      `La charte du télétravail passe en ${RULES.charterVersion}. Elle remplace la ${RULES.previousCharterVersion} pour toutes les nouvelles demandes.`,
      'Vous pouvez la lire et l’accepter depuis la page de la charte, quand vous voulez.',
    ],
    link: { label: 'Lire la charte du télétravail', to: '/teletravail/charte' },
  },
  {
    slug: 'greve-transports-teletravail-exceptionnel',
    title: 'Grève des transports : pensez au télétravail exceptionnel',
    summary: 'En cas de grève, une demande exceptionnelle est possible le jour même.',
    publishedAt: '2026-10-08',
    category: 'teletravail',
    body: [
      'Un mouvement de grève est annoncé dans les transports. Si votre trajet est perturbé, vous pouvez demander du télétravail exceptionnel.',
      'Cette demande est possible le jour même et n’est pas décomptée de votre solde de jours occasionnels. Indiquez le motif « Grève des transports ».',
    ],
    link: {
      label: 'Faire une demande exceptionnelle',
      to: '/demandes/nouvelle?type=exceptional',
    },
  },
  {
    slug: 'teletravail-regulier-delai',
    title: `Télétravail régulier : demandez-le ${RULES.regularNoticeDays} jours à l’avance`,
    summary: `Le télétravail régulier se demande ${RULES.regularNoticeDays} jours avant le premier jour concerné.`,
    publishedAt: '2026-09-22',
    category: 'teletravail',
    body: [
      `Pour un télétravail régulier, la demande doit être faite au moins ${RULES.regularNoticeDays} jours avant le premier jour concerné.`,
      'Le portail vérifie ce délai avant l’envoi de la demande.',
      'Pour un besoin ponctuel, préférez une demande occasionnelle.',
    ],
    link: { label: 'Demander un télétravail régulier', to: '/demandes/nouvelle?type=regular' },
  },
  {
    slug: 'campagne-entretiens-annuels',
    title: 'La campagne des entretiens annuels démarre',
    summary: 'Préparez votre entretien et prenez rendez-vous avec votre manager.',
    publishedAt: '2026-09-08',
    category: 'vie-entreprise',
    body: [
      'La campagne des entretiens annuels est ouverte. Votre manager vous contacte pour fixer le rendez-vous.',
      'Prenez un moment pour faire le bilan de l’année et noter vos souhaits d’évolution avant le rendez-vous.',
    ],
  },
  {
    slug: 'bulletins-de-paie-dematerialises',
    title: 'Vos bulletins de paie sont dématérialisés',
    summary: 'Retrouvez vos bulletins au format PDF dans la rubrique « Ma paie ».',
    publishedAt: '2026-06-15',
    category: 'paie',
    body: [
      'Les bulletins de paie sont désormais disponibles au format numérique. Vous les téléchargez en PDF depuis la rubrique « Ma paie ».',
      'Vous pouvez les télécharger à tout moment, sans rien demander aux RH.',
    ],
  },
]

export const NEWS: NewsArticle[] = [...ARTICLES].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
)

export function newsBySlug(slug: string): NewsArticle | undefined {
  return NEWS.find((article) => article.slug === slug)
}

/** Les `count` articles les plus récents. */
export function latestNews(count: number): NewsArticle[] {
  return NEWS.slice(0, Math.max(0, count))
}
