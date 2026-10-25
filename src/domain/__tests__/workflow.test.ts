import { describe, expect, it } from 'vitest'

import { employeeFromDraft, requestFromDraft } from '../requestFactory'
import { emptyDraft, emptyOnBehalf, type Employee, type TeleworkRequest } from '../types'
import { assertCanTransition } from '../workflow'

const manager: Employee = {
  id: 'e-manager',
  matricule: '00300121',
  firstName: 'Sophie',
  lastName: 'Laurent',
  jobTitle: 'Directrice',
  team: 'Direction',
  costCenter: 'CC-1001-PAR-A',
  managerId: null,
  charterAcceptedVersion: 'v5',
  charterAcceptedAt: '2026-01-10T09:00:00.000Z',
}
const author: Employee = { ...manager, id: 'e-author', managerId: 'e-manager' }

const draft = {
  ...emptyDraft('occasional'),
  reason: 'personal' as const,
  days: [
    { date: '2026-03-06', period: 'day' as const },
    { date: '2026-03-04', period: 'am' as const },
  ],
  comment: '  À bientôt  ',
}
const base = {
  sequence: 7,
  today: '2026-03-02',
  employeeId: 'e-author',
  actorId: 'e-author',
  defaultCostCenter: 'CC-1001-PAR-A',
}

describe('requestFromDraft', () => {
  it('numérote, trie les jours et nettoie le message', () => {
    const request = requestFromDraft(draft, { ...base, enteredByManager: false })
    expect(request.reference).toBe('TT-2026-00007')
    expect(request.days.map((d) => d.date)).toEqual(['2026-03-04', '2026-03-06'])
    expect(request.comment).toBe('À bientôt')
    expect(request.status).toBe('pending')
    expect(request.costCenter).toBe('CC-1001-PAR-A')
    expect(request.history).toHaveLength(1)
  })

  it('valide tout de suite une demande saisie par un manager', () => {
    const request = requestFromDraft(draft, {
      ...base,
      actorId: 'e-manager',
      enteredByManager: true,
    })
    expect(request.status).toBe('approved')
    expect(request.history.map((e) => e.action)).toEqual(['submitted', 'approved'])
    expect(request.history[0]?.comment).toBe('Saisie par le manager')
  })

  it('ne garde que les jours d’un régulier ou le rythme', () => {
    const regular = {
      ...draft,
      type: 'regular' as const,
      weeklySlots: [{ weekday: 1 as const, period: 'day' as const }],
      startDate: '2026-03-30',
    }
    const request = requestFromDraft(regular, { ...base, enteredByManager: false })
    expect(request.days).toEqual([])
    expect(request.startDate).toBe('2026-03-30')
    expect(requestFromDraft(draft, { ...base, enteredByManager: false }).weeklySlots).toEqual([])
  })
})

describe('employeeFromDraft', () => {
  it('crée un collaborateur rattaché au manager', () => {
    const who = {
      ...emptyOnBehalf('other'),
      matricule: '00700001',
      firstName: ' Nina ',
      lastName: 'durand',
    }
    const employee = employeeFromDraft({ ...draft, onBehalf: who }, manager, 9)
    expect(employee).toMatchObject({
      id: 'e-ext-0009',
      firstName: 'Nina',
      lastName: 'DURAND',
      managerId: 'e-manager',
      team: 'Direction',
      costCenter: 'CC-1001-PAR-A',
    })
  })
})

describe('assertCanTransition', () => {
  const request = {
    employeeId: 'e-author',
    status: 'pending',
    type: 'occasional',
    days: [{ date: '2026-03-10', period: 'day' }],
  } as TeleworkRequest
  const ctx = { today: '2026-03-02', author }

  it('laisse le manager valider une demande en attente', () => {
    expect(() =>
      assertCanTransition(request, 'approved', { ...ctx, actorId: 'e-manager' }),
    ).not.toThrow()
  })

  it('refuse à quelqu’un d’autre que le manager', () => {
    expect(() => assertCanTransition(request, 'approved', { ...ctx, actorId: 'e-other' })).toThrow(
      'Action non autorisée',
    )
  })

  it('refuse une demande déjà traitée et un refus sans motif', () => {
    const done = { ...request, status: 'approved' } as TeleworkRequest
    expect(() =>
      assertCanTransition(done, 'rejected', { ...ctx, actorId: 'e-manager', comment: 'non' }),
    ).toThrow('déjà été traitée')
    expect(() =>
      assertCanTransition(request, 'rejected', { ...ctx, actorId: 'e-manager', comment: ' ' }),
    ).toThrow('motif')
  })

  it('réserve l’annulation au demandeur, tant que la demande est en cours', () => {
    expect(() =>
      assertCanTransition(request, 'cancelled', { ...ctx, actorId: 'e-author' }),
    ).not.toThrow()
    expect(() =>
      assertCanTransition(request, 'cancelled', { ...ctx, actorId: 'e-manager' }),
    ).toThrow('Action non autorisée')
    const past = { ...request, status: 'approved' } as TeleworkRequest
    expect(() =>
      assertCanTransition(past, 'cancelled', { ...ctx, today: '2026-04-01', actorId: 'e-author' }),
    ).toThrow('plus être annulée')
  })
})
