import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { todayISO, yearOf } from '@/domain/dates'
import { employeeFromDraft, historyEvent, requestFromDraft } from '@/domain/requestFactory'
import { RULES } from '@/domain/rules'
import { sortRequests } from '@/domain/requestFilters'
import { isOngoing, occasionalBalance, unavailableDates } from '@/domain/schedule'
import { createSeed, isPortalState, type PortalState } from '@/domain/seed'
import type { Employee, HistoryEvent, RequestDraft, TeleworkRequest } from '@/domain/types'
import { validateDraft, type ValidationContext, type ValidationError } from '@/domain/validation'
import { assertCanTransition } from '@/domain/workflow'
import { createJsonStore, STORAGE_PREFIX } from '@/services/storage'

const portalStorage = createJsonStore<PortalState>(`${STORAGE_PREFIX}:state:v1`, isPortalState)

export class ValidationFailedError extends Error {
  constructor(public readonly errors: ValidationError[]) {
    super('La demande contient des erreurs.')
  }
}

// Collaborateurs et demandes, sauvegardés dans le navigateur à chaque modification.
export const usePortalStore = defineStore('portal', () => {
  const state = ref<PortalState>(portalStorage.load() ?? createSeed(todayISO()))
  const persistenceError = ref(false)

  watch(
    state,
    (value) => {
      persistenceError.value = !portalStorage.save(value)
    },
    { deep: true, immediate: true },
  )

  // Rafraîchie chaque minute : un onglet resté ouvert après minuit change de jour.
  const now = ref(new Date())
  if (typeof window !== 'undefined') window.setInterval(() => (now.value = new Date()), 60_000)
  const today = computed(() => todayISO(now.value))
  const employees = computed(() => state.value.employees)
  const requests = computed(() => state.value.requests)

  const currentUser = computed<Employee>(() => {
    const user = state.value.employees.find((e) => e.id === state.value.currentUserId)
    if (!user) throw new Error('Utilisateur courant introuvable')
    return user
  })
  const manager = computed(() => employeeById(currentUser.value.managerId))
  const charterAccepted = computed(
    () => currentUser.value.charterAcceptedVersion === RULES.charterVersion,
  )

  const myRequests = computed(() =>
    sortRequests(
      state.value.requests.filter((r) => r.employeeId === currentUser.value.id),
      'recent',
    ),
  )
  const teamMembers = computed(() =>
    state.value.employees.filter((e) => e.managerId === currentUser.value.id),
  )
  // Les plus anciennes d'abord : ce sont celles qui attendent depuis le plus longtemps.
  const teamPending = computed(() => {
    const ids = new Set(teamMembers.value.map((e) => e.id))
    const pending = state.value.requests.filter(
      (r) => r.status === 'pending' && ids.has(r.employeeId),
    )
    return sortRequests(pending, 'oldest')
  })
  const balance = computed(() =>
    occasionalBalance(state.value.requests, currentUser.value.id, Number(yearOf(today.value))),
  )

  const bookedDates = computed(() =>
    unavailableDates(state.value.requests, currentUser.value.id, today.value),
  )

  function employeeById(id: string | null | undefined): Employee | undefined {
    return id ? state.value.employees.find((e) => e.id === id) : undefined
  }

  function requestById(id: string): TeleworkRequest | undefined {
    return state.value.requests.find((r) => r.id === id)
  }

  /** La personne concernée par la saisie, ou `undefined` pour une personne pas encore enregistrée. */
  function targetOf(draft: RequestDraft): Employee | undefined {
    if (draft.onBehalf.kind === 'self') return currentUser.value
    if (draft.onBehalf.kind === 'member') {
      return teamMembers.value.find((e) => e.id === draft.onBehalf.employeeId)
    }
    return undefined
  }

  function balanceFor(employee: Employee | undefined) {
    return employee
      ? occasionalBalance(state.value.requests, employee.id, Number(yearOf(today.value)))
      : {
          allowance: RULES.occasionalAllowancePerYear,
          pending: 0,
          available: RULES.occasionalAllowancePerYear,
        }
  }

  function bookedDatesFor(employee: Employee | undefined): Set<string> {
    return employee ? unavailableDates(state.value.requests, employee.id, today.value) : new Set()
  }

  function validationContext(draft: RequestDraft): ValidationContext {
    const target = targetOf(draft)
    return {
      today: today.value,
      availableBalance: balanceFor(target).available,
      bookedDates: bookedDatesFor(target),
      // La charte est acceptée par la personne elle-même, pas par son manager.
      charterAlreadyAccepted: draft.onBehalf.kind === 'self' ? charterAccepted.value : true,
      knownMatricules: new Set(state.value.employees.map((e) => e.matricule)),
    }
  }

  function validate(draft: RequestDraft): ValidationError[] {
    return validateDraft(draft, validationContext(draft))
  }

  /** Lève `ValidationFailedError` si la saisie est invalide. */
  function submit(draft: RequestDraft): TeleworkRequest {
    const errors = validate(draft)
    if (errors.length) throw new ValidationFailedError(errors)

    const enteredByManager = draft.onBehalf.kind !== 'self'
    if (!enteredByManager && !charterAccepted.value) acceptCharter()

    state.value.sequence += 1
    const sequence = state.value.sequence
    let employee = targetOf(draft)
    if (!employee) {
      employee = employeeFromDraft(draft, currentUser.value, sequence)
      state.value.employees.push(employee)
    }
    const request = requestFromDraft(draft, {
      sequence,
      today: today.value,
      employeeId: employee.id,
      actorId: currentUser.value.id,
      defaultCostCenter: currentUser.value.costCenter,
      enteredByManager,
    })
    state.value.requests.push(request)
    return request
  }

  function transition(
    id: string,
    action: Exclude<HistoryEvent['action'], 'submitted'>,
    comment?: string,
  ): TeleworkRequest {
    const request = requestById(id)
    if (!request) throw new Error(`Demande ${id} introuvable`)
    assertCanTransition(request, action, {
      actorId: currentUser.value.id,
      today: today.value,
      author: employeeById(request.employeeId),
      comment,
    })
    request.status = action
    request.history.push(historyEvent(currentUser.value.id, action, comment?.trim()))
    return request
  }

  const approve = (id: string, comment?: string) => transition(id, 'approved', comment)
  const reject = (id: string, comment: string) => transition(id, 'rejected', comment)
  const cancel = (id: string) => transition(id, 'cancelled')

  function canCancel(request: TeleworkRequest): boolean {
    return request.employeeId === currentUser.value.id && isOngoing(request, today.value)
  }

  function acceptCharter() {
    currentUser.value.charterAcceptedVersion = RULES.charterVersion
    currentUser.value.charterAcceptedAt = new Date().toISOString()
  }

  function resetDemo() {
    state.value = createSeed(today.value)
  }

  return {
    state,
    today,
    persistenceError,
    employees,
    requests,
    currentUser,
    manager,
    charterAccepted,
    myRequests,
    teamMembers,
    teamPending,
    balance,
    bookedDates,
    targetOf,
    balanceFor,
    bookedDatesFor,
    employeeById,
    requestById,
    validate,
    submit,
    approve,
    reject,
    cancel,
    canCancel,
    acceptCharter,
    resetDemo,
  }
})
