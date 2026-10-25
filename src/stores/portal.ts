import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { todayISO, yearOf } from '@/domain/dates'
import { RULES } from '@/domain/rules'
import { sortRequests } from '@/domain/requestFilters'
import { isOngoing, occasionalBalance, unavailableDates } from '@/domain/schedule'
import { createSeed, isPortalState, type PortalState } from '@/domain/seed'
import type { Employee, HistoryEvent, RequestDraft, TeleworkRequest } from '@/domain/types'
import { validateDraft, type ValidationContext, type ValidationError } from '@/domain/validation'
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

  const today = computed(() => todayISO(new Date()))
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

  function validationContext(): ValidationContext {
    return {
      today: today.value,
      availableBalance: balance.value.available,
      bookedDates: bookedDates.value,
      charterAlreadyAccepted: charterAccepted.value,
    }
  }

  function validate(draft: RequestDraft): ValidationError[] {
    return validateDraft(draft, validationContext())
  }

  function event(action: HistoryEvent['action'], comment?: string): HistoryEvent {
    return {
      at: new Date().toISOString(),
      actorId: currentUser.value.id,
      action,
      ...(comment ? { comment } : {}),
    }
  }

  /** Lève `ValidationFailedError` si la saisie est invalide. */
  function submit(draft: RequestDraft): TeleworkRequest {
    const errors = validate(draft)
    if (errors.length) throw new ValidationFailedError(errors)

    if (!charterAccepted.value) acceptCharter()

    state.value.sequence += 1
    const sequence = state.value.sequence
    const isRegular = draft.type === 'regular'
    const request: TeleworkRequest = {
      id: `r-${String(sequence).padStart(4, '0')}-${Date.now().toString(36)}`,
      reference: `TT-${yearOf(today.value)}-${String(sequence).padStart(5, '0')}`,
      employeeId: currentUser.value.id,
      type: draft.type,
      days: isRegular ? [] : [...draft.days].sort((a, b) => a.date.localeCompare(b.date)),
      weeklySlots: isRegular ? [...draft.weeklySlots].sort((a, b) => a.weekday - b.weekday) : [],
      startDate: isRegular ? draft.startDate : '',
      endDate: isRegular ? draft.endDate : '',
      reason: draft.type === 'exceptional' ? draft.reason : '',
      comment: draft.comment.trim(),
      attachment: draft.type === 'exceptional' ? draft.attachment : null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      history: [event('submitted')],
    }
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

    if (action === 'cancelled') {
      if (request.employeeId !== currentUser.value.id) throw new Error('Action non autorisée')
      if (!isOngoing(request, today.value))
        throw new Error('Cette demande ne peut plus être annulée')
    } else {
      const author = employeeById(request.employeeId)
      if (author?.managerId !== currentUser.value.id) throw new Error('Action non autorisée')
      if (request.status !== 'pending') throw new Error('Cette demande a déjà été traitée')
      if (action === 'rejected' && !comment?.trim()) throw new Error('Un motif de refus est requis')
    }

    request.status = action
    request.history.push(event(action, comment?.trim()))
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
