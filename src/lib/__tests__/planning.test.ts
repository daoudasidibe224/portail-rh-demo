import { describe, expect, it } from 'vitest'

import { PLANNING_MAX_WEEKS, planningFor } from '../planningWeeks'
import { emptyDraft, type TeleworkRequest } from '../types'

describe('planningFor', () => {
  it('reste vide tant qu’aucune date n’est choisie', () => {
    expect(planningFor(emptyDraft(), [], 'e-1').weeks).toEqual([])
  })

  it('montre le jour demandé, les jours fériés et les jours sur site', () => {
    const draft = { ...emptyDraft(), days: [{ date: '2026-04-29', period: 'am' as const }] }
    const { weeks, truncated } = planningFor(draft, [], 'e-1')
    expect(weeks).toHaveLength(1)
    expect(truncated).toBe(false)
    const kinds = weeks[0]!.days.map((d) => d.kind)
    expect(kinds).toEqual(['office', 'office', 'draft', 'office', 'holiday'])
    expect(weeks[0]!.days[2]!.period).toBe('am')
  })

  it('affiche les demandes déjà en cours, la saisie primant', () => {
    const existing = {
      employeeId: 'e-1',
      type: 'occasional',
      status: 'pending',
      days: [
        { date: '2026-03-03', period: 'day' },
        { date: '2026-03-04', period: 'day' },
      ],
      weeklySlots: [],
      startDate: '',
      endDate: '',
    } as unknown as TeleworkRequest
    const draft = { ...emptyDraft(), days: [{ date: '2026-03-04', period: 'day' as const }] }
    const kinds = planningFor(draft, [existing], 'e-1').weeks[0]!.days.map((d) => d.kind)
    expect(kinds.slice(0, 3)).toEqual(['office', 'pending', 'draft'])
  })

  it('limite un rythme sans fin à 6 semaines et le signale', () => {
    const draft = {
      ...emptyDraft('regular'),
      weeklySlots: [{ weekday: 1 as const, period: 'day' as const }],
      startDate: '2026-03-30',
    }
    const { weeks, truncated } = planningFor(draft, [], 'e-1')
    expect(weeks).toHaveLength(PLANNING_MAX_WEEKS)
    expect(truncated).toBe(true)
  })

  it('s’arrête à la date de fin d’un rythme', () => {
    const draft = {
      ...emptyDraft('regular'),
      weeklySlots: [{ weekday: 1 as const, period: 'day' as const }],
      startDate: '2026-03-30',
      endDate: '2026-04-14',
    }
    expect(planningFor(draft, [], 'e-1').weeks).toHaveLength(3)
  })
})
