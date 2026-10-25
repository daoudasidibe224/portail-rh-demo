import { describe, expect, it } from 'vitest'

import { occasionalBalance } from '../schedule'
import { createSeed } from '../seed'

describe('createSeed', () => {
  const seed = createSeed('2026-10-26')

  it('relie chaque demande à un collaborateur connu, avec des références uniques', () => {
    const ids = new Set(seed.employees.map((e) => e.id))
    expect(seed.requests.every((r) => ids.has(r.employeeId))).toBe(true)
    expect(new Set(seed.requests.map((r) => r.reference)).size).toBe(seed.requests.length)
    expect(seed.sequence).toBe(seed.requests.length)
  })

  it('laisse 3,5 jours de solde occasionnel à Camille', () => {
    expect(occasionalBalance(seed.requests, 'e-camille', 2026).available).toBe(3.5)
  })
})
