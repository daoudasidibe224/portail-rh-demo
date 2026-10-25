import { describe, expect, it } from 'vitest'

import { describeQuantity, describeSchedule, formatHours } from '../format'
import { RULES } from '../rules'
import { entryFor, isOngoing, occasionalBalance, unavailableDates } from '../schedule'
import type { TeleworkRequest } from '../types'

function request(overrides: Partial<TeleworkRequest>): TeleworkRequest {
  return {
    id: 'r-1',
    reference: 'TT-2026-00001',
    employeeId: 'e-1',
    type: 'occasional',
    days: [],
    weeklySlots: [],
    startDate: '',
    endDate: '',
    reason: 'personal',
    comment: '',
    attachment: null,
    status: 'approved',
    createdAt: '2026-01-01T09:00:00.000Z',
    history: [],
    ...overrides,
  }
}

describe('occasionalBalance', () => {
  it('décompte les demandes validées et en attente', () => {
    const requests = [
      request({ days: [{ date: '2026-03-04', period: 'day' }] }),
      request({ status: 'pending', days: [{ date: '2026-03-05', period: 'am' }] }),
      request({ status: 'rejected', days: [{ date: '2026-03-06', period: 'day' }] }),
    ]
    expect(occasionalBalance(requests, 'e-1', 2026)).toEqual({
      allowance: RULES.occasionalAllowancePerYear,
      pending: 0.5,
      available: RULES.occasionalAllowancePerYear - 1.5,
    })
  })

  it('compte les jours ponctuels d’une demande mixte', () => {
    const mixed = request({
      type: 'mixed',
      weeklySlots: [{ weekday: 3, period: 'am' }],
      startDate: '2026-03-02',
      days: [{ date: '2026-03-12', period: 'day' }],
    })
    expect(occasionalBalance([mixed], 'e-1', 2026).available).toBe(7)
  })

  it('ignore les autres collaborateurs et les autres années', () => {
    const requests = [
      request({ employeeId: 'e-2', days: [{ date: '2026-03-04', period: 'day' }] }),
      request({ days: [{ date: '2025-12-01', period: 'day' }] }),
    ]
    expect(occasionalBalance(requests, 'e-1', 2026).available).toBe(8)
  })
})

describe('entryFor', () => {
  const regular = request({
    type: 'regular',
    weeklySlots: [{ weekday: 1, period: 'day' }],
    startDate: '2026-03-02',
    endDate: '2026-03-31',
    days: [],
  })

  it('suit le rythme entre le début et la fin', () => {
    expect(entryFor([regular], 'e-1', '2026-03-09')?.period).toBe('day')
    expect(entryFor([regular], 'e-1', '2026-03-10')).toBeNull()
    expect(entryFor([regular], 'e-1', '2026-04-06')).toBeNull()
  })

  it('combine rythme et jours dans une demande mixte, le jour ponctuel primant', () => {
    const mixed = request({
      type: 'mixed',
      weeklySlots: [{ weekday: 1, period: 'day' }],
      startDate: '2026-03-02',
      days: [
        { date: '2026-03-11', period: 'am' },
        { date: '2026-03-16', period: 'pm' },
      ],
    })
    expect(entryFor([mixed], 'e-1', '2026-03-09')?.period).toBe('day')
    expect(entryFor([mixed], 'e-1', '2026-03-11')?.period).toBe('am')
    expect(entryFor([mixed], 'e-1', '2026-03-16')?.period).toBe('pm')
  })

  it('ignore les demandes refusées', () => {
    expect(entryFor([{ ...regular, status: 'rejected' }], 'e-1', '2026-03-09')).toBeNull()
  })
})

describe('unavailableDates', () => {
  it('inclut les jours d’un rythme mixte et ses jours ponctuels', () => {
    const mixed = request({
      type: 'mixed',
      weeklySlots: [{ weekday: 3, period: 'day' }],
      startDate: '2026-03-02',
      days: [{ date: '2026-03-12', period: 'day' }],
    })
    const dates = unavailableDates([mixed], 'e-1', '2026-03-02', 30)
    expect(dates.has('2026-03-04')).toBe(true)
    expect(dates.has('2026-03-12')).toBe(true)
    expect(dates.has('2026-03-05')).toBe(false)
  })
})

describe('isOngoing', () => {
  it('garde actif un rythme sans date de fin, mixte compris', () => {
    const mixed = request({
      type: 'mixed',
      weeklySlots: [{ weekday: 3, period: 'day' }],
      startDate: '2026-01-05',
      days: [{ date: '2026-01-14', period: 'day' }],
    })
    expect(isOngoing(mixed, '2026-06-01')).toBe(true)
  })

  it('termine une demande ponctuelle passée', () => {
    expect(
      isOngoing(request({ days: [{ date: '2026-01-14', period: 'day' }] }), '2026-06-01'),
    ).toBe(false)
  })
})

describe('formats', () => {
  it('convertit les jours en heures (1 jour = 7 h 24)', () => {
    expect(formatHours(1)).toBe('7 h 24')
    expect(formatHours(3.5)).toBe('25 h 54')
    expect(formatHours(0)).toBe('0 h')
  })

  it('décrit un rythme et une demande mixte', () => {
    const regular = {
      type: 'regular' as const,
      days: [],
      weeklySlots: [{ weekday: 1 as const, period: 'day' as const }],
      startDate: '2026-03-30',
      endDate: '',
    }
    expect(describeSchedule(regular)).toContain('Chaque lundi')
    expect(describeQuantity(regular)).toBe('1 jour par semaine')
    const mixed = {
      ...regular,
      type: 'mixed' as const,
      days: [{ date: '2026-03-12', period: 'am' as const }],
    }
    expect(describeQuantity(mixed)).toBe('1 jour par semaine, plus 0,5 jour')
  })
})
