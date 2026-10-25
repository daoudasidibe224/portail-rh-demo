<script setup lang="ts">
import { ArrowLeft, CircleCheck, Copy, FileText, Printer } from 'lucide-vue-next'
import { computed, nextTick, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppButton from '@/components/ui/AppButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { usePageParent } from '@/composables/usePageTitle'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/domain/dates'
import { describeQuantity, describeSchedule, describeType, formatBytes } from '@/domain/format'
import { REASONS } from '@/domain/rules'
import { fullName } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

import NotFoundView from './NotFoundView.vue'

const props = defineProps<{ id: string }>()
const portal = usePortalStore()
const route = useRoute()
const { show } = useToast()
const heading = usePageHeading()

const request = computed(() => portal.requestById(props.id))
const author = computed(() => portal.employeeById(request.value?.employeeId))
const isMine = computed(() => request.value?.employeeId === portal.currentUser.id)
const isTeam = computed(() => author.value?.managerId === portal.currentUser.id)
usePageParent(() => (isTeam.value && !isMine.value ? 'team' : null))
const justSent = computed(() => route.query.envoyee === '1' && request.value?.status === 'pending')

const actionLabels = {
  submitted: 'Demande envoyée',
  approved: 'Demande validée',
  rejected: 'Demande refusée',
  cancelled: 'Demande annulée',
} as const

const print = () => window.print()

const cancelOpen = ref(false)
const rejectOpen = ref(false)

/* Les boutons disparaissent une fois la demande traitée : le focus revient au titre.
   Le setTimeout laisse le dialogue rendre son propre focus d'abord. */
async function run(action: () => unknown, message: string) {
  try {
    action()
    show(message)
    await nextTick()
    setTimeout(() => heading.value?.focus(), 0)
  } catch (error) {
    show('Action impossible', {
      tone: 'error',
      description: error instanceof Error ? error.message : undefined,
    })
  }
}
</script>

<template>
  <NotFoundView v-if="!request || (!isMine && !isTeam)" />
  <article v-else class="max-w-3xl pb-8">
    <RouterLink
      :to="isMine ? '/teletravail' : '/equipe'"
      class="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-ink-900 print:hidden"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      {{ isMine ? 'Mon télétravail' : 'Mon équipe' }}
    </RouterLink>

    <div
      v-if="justSent"
      role="status"
      class="mt-4 flex gap-3 rounded-lg border border-success-700/30 bg-success-50 p-4 text-success-700 print:hidden"
    >
      <CircleCheck class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p>
        <strong>Votre demande est envoyée.</strong>
        {{ portal.manager ? fullName(portal.manager) : 'Votre manager' }} a été notifié(e) et vous
        recevrez sa réponse sur ce portail.
      </p>
    </div>

    <header class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <p class="text-sm text-ink-600">Réf. {{ request.reference }}</p>
        <h1
          id="page-title"
          ref="heading"
          tabindex="-1"
          class="mt-1 font-condensed text-3xl font-semibold break-words text-ink-900"
        >
          {{ describeType(request) }}
        </h1>
        <p v-if="!isMine && author" class="mt-1 text-ink-700">
          {{ fullName(author) }}, {{ author.jobTitle.toLowerCase() }}
        </p>
      </div>
      <StatusBadge :status="request.status" class="self-start" />
    </header>

    <section aria-labelledby="details-title" class="card mt-6 p-5 sm:p-6">
      <h2 id="details-title" class="sr-only">Détails</h2>
      <dl class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <dt class="text-sm text-ink-600">
            {{ request.type === 'regular' ? 'Rythme' : 'Dates' }}
          </dt>
          <dd class="mt-0.5 font-medium text-ink-900 first-letter:uppercase">
            {{ describeSchedule(request) }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-ink-600">Durée</dt>
          <dd class="mt-0.5 font-medium text-ink-900">{{ describeQuantity(request) }}</dd>
        </div>
        <div v-if="request.reason">
          <dt class="text-sm text-ink-600">Motif</dt>
          <dd class="mt-0.5 font-medium text-ink-900">{{ REASONS[request.reason] }}</dd>
        </div>
        <div v-if="request.comment" class="sm:col-span-2">
          <dt class="text-sm text-ink-600">Message</dt>
          <dd class="mt-0.5 break-words text-ink-900">{{ request.comment }}</dd>
        </div>
        <div v-if="request.attachment" class="sm:col-span-2">
          <dt class="text-sm text-ink-600">Justificatif</dt>
          <dd class="mt-0.5 flex items-start gap-2 text-ink-900">
            <FileText class="mt-1 size-4 shrink-0 text-ink-600" aria-hidden="true" />
            <span class="min-w-0 break-words">
              {{ request.attachment.name }}
              <span class="text-ink-600">({{ formatBytes(request.attachment.size) }})</span>
            </span>
          </dd>
        </div>
      </dl>
    </section>

    <section aria-labelledby="history-title" class="card mt-6 p-5 sm:p-6">
      <h2 id="history-title" class="text-lg font-semibold text-ink-900">Suivi</h2>
      <ol class="mt-4 space-y-4 border-l-2 border-ink-200 pl-5">
        <li v-for="(event, i) in request.history" :key="i" class="relative">
          <span
            class="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-ink-700"
            aria-hidden="true"
          />
          <p class="font-medium text-ink-900">{{ actionLabels[event.action] }}</p>
          <p class="text-sm text-ink-600">
            {{ formatDateTime(event.at) }}, par
            {{
              portal.employeeById(event.actorId)
                ? fullName(portal.employeeById(event.actorId)!)
                : 'le système'
            }}
          </p>
          <p
            v-if="event.comment"
            class="mt-1 rounded-lg bg-ink-50 px-3 py-2 text-sm break-words text-ink-900"
          >
            « {{ event.comment }} »
          </p>
        </li>
        <li v-if="request.status === 'pending'" class="relative">
          <span
            class="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full border-2 border-ink-400 bg-white"
            aria-hidden="true"
          />
          <p class="font-medium text-ink-700">
            En attente de
            {{
              isMine
                ? portal.manager
                  ? fullName(portal.manager)
                  : 'votre manager'
                : 'votre décision'
            }}
          </p>
        </li>
      </ol>
    </section>

    <div class="mt-6 flex flex-col gap-2 sm:flex-row print:hidden">
      <template v-if="isMine">
        <AppButton variant="secondary" :to="{ name: 'new-request', query: { depuis: request.id } }">
          <Copy class="size-4" aria-hidden="true" /> Refaire une demande similaire
        </AppButton>
        <AppButton v-if="portal.canCancel(request)" variant="danger" @click="cancelOpen = true">
          Annuler la demande
        </AppButton>
      </template>
      <template v-else-if="request.status === 'pending'">
        <AppButton
          @click="
            run(
              () => portal.approve(request!.id),
              `Demande de ${author ? fullName(author) : ''} validée`,
            )
          "
        >
          Valider
        </AppButton>
        <AppButton variant="danger" @click="rejectOpen = true">Refuser</AppButton>
      </template>
      <AppButton variant="secondary" class="sm:ml-auto" @click="print">
        <Printer class="size-4" aria-hidden="true" /> Imprimer
      </AppButton>
    </div>

    <ConfirmDialog
      v-model:open="cancelOpen"
      title="Annuler cette demande ?"
      :description="
        request.type === 'occasional'
          ? 'Les jours seront recrédités sur votre solde.'
          : 'Votre manager sera informé(e).'
      "
      confirm-label="Annuler la demande"
      cancel-label="Garder la demande"
      tone="danger"
      @confirm="run(() => portal.cancel(request!.id), 'Demande annulée')"
    />
    <ConfirmDialog
      v-model:open="rejectOpen"
      title="Refuser la demande ?"
      confirm-label="Refuser"
      tone="danger"
      comment-label="Motif du refus"
      comment-required
      @confirm="(c) => run(() => portal.reject(request!.id, c), 'Demande refusée')"
    />
  </article>
</template>
