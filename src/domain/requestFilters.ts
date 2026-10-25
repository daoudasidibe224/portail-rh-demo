import type { TeleworkRequest } from './types'

export type RequestSort = 'recent' | 'oldest'

const compareBySent = (a: TeleworkRequest, b: TeleworkRequest) =>
  a.createdAt.localeCompare(b.createdAt)

/** Trie une copie, par date d'envoi. */
export function sortRequests(
  requests: readonly TeleworkRequest[],
  key: RequestSort,
): TeleworkRequest[] {
  const copy = [...requests]
  return key === 'recent' ? copy.sort((a, b) => compareBySent(b, a)) : copy.sort(compareBySent)
}
