import type { ISODate } from '../dates'

// Contenu fictif des services hors télétravail.
interface ServiceTile {
  label: string
  value: string
  hint?: string
}

interface ServiceRow {
  title: string
  meta: string
  status?: string
}

export interface ServiceContent {
  tiles: ServiceTile[]
  listTitle: string
  rows: ServiceRow[]
  // Ce que le vrai service permettrait en plus.
  later: string
}

export const monthName = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
export const euro = (n: number) => `${n.toFixed(2).replace('.', ',')} €`

export function firstOfMonth(today: ISODate): ISODate {
  return `${today.slice(0, 8)}01`
}
