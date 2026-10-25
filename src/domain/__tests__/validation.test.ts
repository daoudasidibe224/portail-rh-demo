import { describe, expect, it } from 'vitest'

import { emptyDraft, emptyOnBehalf, type RequestDraft } from '../types'
import { validateDraft, type FieldKey, type ValidationContext } from '../validation'

// Lundi 2 mars 2026.
const ctx: ValidationContext = {
  today: '2026-03-02',
  availableBalance: 8,
  bookedDates: new Set(),
  charterAlreadyAccepted: true,
  knownMatricules: new Set(['00418273']),
}

function draft(overrides: Partial<RequestDraft>): RequestDraft {
  return {
    ...emptyDraft(),
    reason: 'personal',
    connectionConfirmed: true,
    days: [{ date: '2026-03-04', period: 'day' }],
    ...overrides,
  }
}

const fields = (d: RequestDraft, context = ctx): FieldKey[] =>
  validateDraft(d, context).map((e) => e.field)

describe('validateDraft', () => {
  it('accepte une demande occasionnelle complète', () => {
    expect(fields(draft({}))).toEqual([])
  })

  it('exige au moins un jour', () => {
    expect(fields(draft({ days: [] }))).toContain('days')
  })

  it('refuse un week-end, un jour férié et un jour passé', () => {
    expect(fields(draft({ days: [{ date: '2026-03-07', period: 'day' }] }))).toContain('days')
    expect(fields(draft({ days: [{ date: '2026-05-01', period: 'day' }] }))).toContain('days')
    expect(fields(draft({ days: [{ date: '2026-02-27', period: 'day' }] }))).toContain('days')
  })

  it('refuse un jour déjà demandé', () => {
    const booked = { ...ctx, bookedDates: new Set(['2026-03-04']) }
    expect(fields(draft({}), booked)).toContain('days')
  })

  it('refuse un dépassement du solde occasionnel', () => {
    expect(fields(draft({}), { ...ctx, availableBalance: 0.5 })).toContain('days')
  })

  it('ne décompte pas le solde pour une demande exceptionnelle', () => {
    expect(fields(draft({ type: 'exceptional' }), { ...ctx, availableBalance: 0 })).toEqual([])
  })

  it('exige un motif, et un message pour « Autre (préciser) »', () => {
    expect(fields(draft({ reason: '' }))).toContain('reason')
    expect(fields(draft({ reason: 'other' }))).toContain('comment')
    expect(fields(draft({ reason: 'unspecified' }))).toEqual([])
  })

  it('exige l’attestation de connexion', () => {
    expect(fields(draft({ connectionConfirmed: false }))).toContain('connection')
  })

  it('demande la charte tant qu’elle n’est pas acceptée', () => {
    const notAccepted = { ...ctx, charterAlreadyAccepted: false }
    expect(fields(draft({}), notAccepted)).toContain('charter')
    expect(fields(draft({ charterAccepted: true }), notAccepted)).toEqual([])
  })

  it('refuse les types qui ne sont pas du télétravail', () => {
    expect(fields(draft({ type: 'absence' }))).toEqual(['type'])
    expect(fields(draft({ type: 'unused' }))).toEqual(['type'])
  })
})

describe('télétravail régulier', () => {
  const regular = (overrides: Partial<RequestDraft> = {}) =>
    draft({
      type: 'regular',
      days: [],
      weeklySlots: [{ weekday: 1, period: 'day' }],
      startDate: '2026-03-30',
      ...overrides,
    })

  it('accepte un rythme valide', () => {
    expect(fields(regular())).toEqual([])
  })

  it('limite à 2 jours par semaine', () => {
    const slots = [1, 2, 3].map((weekday) => ({
      weekday: weekday as 1 | 2 | 3,
      period: 'day' as const,
    }))
    expect(fields(regular({ weeklySlots: slots }))).toContain('weeklySlots')
  })

  it('respecte le délai de prévenance de 14 jours', () => {
    expect(fields(regular({ startDate: '2026-03-10' }))).toContain('startDate')
  })

  it('limite la durée à 12 mois et refuse une fin avant le début', () => {
    expect(fields(regular({ endDate: '2027-04-30' }))).toContain('endDate')
    expect(fields(regular({ endDate: '2026-03-20' }))).toContain('endDate')
  })
})

describe('télétravail mixte', () => {
  const mixed = (overrides: Partial<RequestDraft> = {}) =>
    draft({
      type: 'mixed',
      weeklySlots: [{ weekday: 1, period: 'day' }],
      startDate: '2026-03-30',
      comment: 'Dérogation accordée par la direction.',
      ...overrides,
    })

  it('accepte un rythme et des jours, avec une explication', () => {
    expect(fields(mixed())).toEqual([])
  })

  it('exige l’explication de la dérogation', () => {
    expect(fields(mixed({ comment: '' }))).toContain('comment')
  })

  it('exige à la fois le rythme et les jours', () => {
    expect(fields(mixed({ days: [] }))).toContain('days')
    expect(fields(mixed({ weeklySlots: [] }))).toContain('weeklySlots')
  })
})

describe('demande pour une autre personne', () => {
  const other = (overrides: Partial<RequestDraft['onBehalf']>) =>
    draft({
      onBehalf: {
        ...emptyOnBehalf('other'),
        matricule: '00700001',
        firstName: 'Nina',
        lastName: 'Durand',
        ...overrides,
      },
    })

  it('accepte une personne saisie à la main', () => {
    expect(fields(other({}))).toEqual([])
  })

  it('contrôle le format du matricule et refuse un doublon', () => {
    expect(fields(other({ matricule: '123' }))).toContain('person')
    expect(fields(other({ matricule: '00418273' }))).toContain('person')
  })

  it('exige le prénom et le nom', () => {
    expect(fields(other({ firstName: ' ' }))).toContain('person')
  })

  it('exige de choisir un membre de l’équipe', () => {
    expect(fields(draft({ onBehalf: emptyOnBehalf('member') }))).toContain('person')
    expect(
      fields(draft({ onBehalf: { ...emptyOnBehalf('member'), employeeId: 'e-leo' } })),
    ).toEqual([])
  })
})
