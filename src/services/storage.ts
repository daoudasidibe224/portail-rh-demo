// localStorage versionné. Une lecture invalide renvoie null ; une écriture refusée renvoie false.
interface JsonStore<T> {
  load(): T | null
  save(value: T): boolean
  clear(): void
}

function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export function createJsonStore<T>(
  key: string,
  isValid: (value: unknown) => value is T,
  storage: Storage | undefined = defaultStorage(),
): JsonStore<T> {
  return {
    load() {
      try {
        const raw = storage?.getItem(key)
        if (!raw) return null
        const parsed: unknown = JSON.parse(raw)
        return isValid(parsed) ? parsed : null
      } catch {
        return null
      }
    },
    save(value) {
      try {
        storage?.setItem(key, JSON.stringify(value))
        return true
      } catch {
        return false
      }
    },
    clear() {
      try {
        storage?.removeItem(key)
      } catch {
        // stockage indisponible, rien à effacer
      }
    },
  }
}

export const STORAGE_PREFIX = 'portail-rh'
