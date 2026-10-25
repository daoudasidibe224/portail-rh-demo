<script setup lang="ts">
import { CircleCheck, FileText, Info, Paperclip, RotateCcw, Send, X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CharterContent from '@/components/request/CharterContent.vue'
import DayPicker from '@/components/request/DayPicker.vue'
import ErrorSummary from '@/components/request/ErrorSummary.vue'
import FieldError from '@/components/request/FieldError.vue'
import TypeChoice from '@/components/request/TypeChoice.vue'
import WeeklyPattern from '@/components/request/WeeklyPattern.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { useToast } from '@/composables/useToast'
import { CONTACT } from '@/domain/contact'
import { addDays, formatDateTime, formatFull, formatTime, isISODate } from '@/domain/dates'
import { describeQuantity, describeSchedule, formatBytes, formatDays } from '@/domain/format'
import { ATTACHMENT_ACCEPT, ATTACHMENT_LABEL, REASONS, REQUEST_TYPES, RULES } from '@/domain/rules'
import { countDays } from '@/domain/schedule'
import { fullName, type ExceptionalReason, type RequestType } from '@/domain/types'
import { errorsFor, type FieldKey } from '@/domain/validation'
import { useDraftStore } from '@/stores/draft'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const drafts = useDraftStore()
const route = useRoute()
const router = useRouter()
const { show } = useToast()
const heading = usePageHeading()

const draft = computed(() => drafts.draft)
const type = computed({
  get: () => drafts.draft.type,
  set: (value: RequestType) => drafts.setType(value),
})

/* Préremplissage depuis un raccourci (?type=&date=) ou une duplication (?depuis=id). */
onMounted(() => {
  const source =
    typeof route.query.depuis === 'string' ? portal.requestById(route.query.depuis) : undefined
  const queryType = route.query.type
  const queryDate = route.query.date
  if (source) {
    drafts.reset({
      type: source.type,
      weeklySlots: source.weeklySlots.map((s) => ({ ...s })),
      reason: source.reason,
      comment: source.comment,
    })
  } else if (typeof queryType === 'string' && queryType in REQUEST_TYPES) {
    drafts.reset({
      type: queryType as RequestType,
      days:
        typeof queryDate === 'string' && isISODate(queryDate)
          ? [{ date: queryDate, period: 'day' }]
          : [],
    })
  }
})

/* Validation : silencieuse jusqu'au premier envoi, puis en direct. */
const attempt = ref(0)
const allErrors = computed(() => portal.validate(draft.value))
const errors = computed(() => (attempt.value ? allErrors.value : []))
const fieldErrors = (field: FieldKey) => errorsFor(errors.value, field)
const invalid = (field: FieldKey) => fieldErrors(field).length > 0
const describedBy = (field: FieldKey, hint?: string) =>
  [hint, invalid(field) ? `${field}-error` : null].filter(Boolean).join(' ') || undefined

const anchors: Record<FieldKey, string> = {
  type: 'field-type',
  days: 'field-days',
  weeklySlots: 'field-weekly',
  startDate: 'field-start',
  endDate: 'field-end',
  reason: 'field-reason',
  comment: 'field-comment',
  attachment: 'field-attachment',
  charter: 'field-charter',
}

const earliestRegularStart = computed(() => addDays(portal.today, RULES.regularNoticeDays))
const requestedDays = computed(() => countDays(draft.value.days))
const balanceAfter = computed(() => portal.balance.available - requestedDays.value)
const reasons = Object.keys(REASONS) as ExceptionalReason[]

const barTitle = computed(() => describeQuantity(draft.value))
const barDetail = computed(() => {
  if (type.value === 'occasional') {
    return balanceAfter.value < 0
      ? `Dépassement de ${formatDays(-balanceAfter.value)}`
      : `Solde : ${formatDays(balanceAfter.value)}`
  }
  return type.value === 'exceptional' ? 'Hors solde' : ''
})

function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  // Seules les métadonnées sont gardées : pas de back-end pour recevoir le fichier.
  drafts.draft.attachment = file ? { name: file.name, size: file.size, type: file.type } : null
}
const fileInput = ref<HTMLInputElement | null>(null)
function removeFile() {
  drafts.draft.attachment = null
  if (fileInput.value) fileInput.value.value = ''
  fileInput.value?.focus()
}

const charterOpen = ref(false)
const cancelOpen = ref(false)

function submit() {
  if (allErrors.value.length) {
    attempt.value += 1
    return
  }
  const request = portal.submit(draft.value)
  drafts.reset()
  show('Demande envoyée', {
    description: `${portal.manager ? fullName(portal.manager) : 'Votre manager'} a été notifié(e).`,
  })
  router.push({ name: 'request', params: { id: request.id }, query: { envoyee: '1' } })
}

function leave() {
  if (drafts.dirty) cancelOpen.value = true
  else router.push('/teletravail')
}

function discard() {
  drafts.reset()
  router.push('/teletravail')
}

/* Le bouton disparaît une fois la saisie effacée : le focus revient au titre,
   après que le dialogue a rendu le sien. */
const resetOpen = ref(false)
async function startOver() {
  drafts.reset()
  attempt.value = 0
  if (fileInput.value) fileInput.value.value = ''
  show('Saisie effacée', { description: 'Le formulaire est vide, vous pouvez recommencer.' })
  await nextTick()
  setTimeout(() => heading.value?.focus(), 0)
}
</script>

<template>
  <div>
    <PageTitle ref="heading">Nouvelle demande de télétravail</PageTitle>
    <p class="mt-2 text-ink-700">
      Votre saisie est enregistrée au fur et à mesure : vous pouvez la reprendre plus tard.
    </p>

    <p
      v-if="drafts.restored"
      class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-info-50 px-4 py-3 text-sm text-info-700"
    >
      <Info class="size-4 shrink-0" aria-hidden="true" />
      <span
        >Nous avons repris votre brouillon<template v-if="drafts.savedAt">
          du {{ formatDateTime(drafts.savedAt) }}</template
        >.</span
      >
    </p>

    <form
      class="mt-8 flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_20rem] lg:items-start"
      novalidate
      @submit.prevent="submit"
    >
      <div class="space-y-8">
        <ErrorSummary :errors="errors" :attempt="attempt" :anchors="anchors" />

        <section class="card p-4 sm:p-6">
          <div :id="anchors.type">
            <TypeChoice v-model="type" />
          </div>
        </section>

        <section class="card p-4 sm:p-6" aria-labelledby="dates-title">
          <h2 id="dates-title" class="text-lg font-semibold text-ink-900">
            {{ type === 'regular' ? 'Rythme et période' : 'Dates' }}
          </h2>

          <div v-if="type !== 'regular'" class="mt-4">
            <DayPicker
              :id="anchors.days"
              v-model="drafts.draft.days"
              :today="portal.today"
              :booked="portal.bookedDates"
              :described-by="describedBy('days')"
              :invalid="invalid('days')"
            />
            <FieldError id="days-error" :messages="fieldErrors('days')" />
          </div>

          <div v-else class="mt-4 space-y-6">
            <div>
              <WeeklyPattern
                :id="anchors.weeklySlots"
                v-model="drafts.draft.weeklySlots"
                :described-by="describedBy('weeklySlots')"
                :invalid="invalid('weeklySlots')"
              />
              <FieldError id="weeklySlots-error" :messages="fieldErrors('weeklySlots')" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label :for="anchors.startDate" class="field-label">
                  Date de début <span class="font-normal text-ink-600">(obligatoire)</span>
                </label>
                <p id="start-hint" class="mt-0.5 text-sm text-ink-600">
                  Au plus tôt le {{ formatFull(earliestRegularStart) }}
                </p>
                <input
                  :id="anchors.startDate"
                  v-model="drafts.draft.startDate"
                  type="date"
                  :min="earliestRegularStart"
                  aria-required="true"
                  :aria-invalid="invalid('startDate') || undefined"
                  :aria-describedby="describedBy('startDate', 'start-hint')"
                  class="field-input mt-1.5"
                />
                <FieldError id="startDate-error" :messages="fieldErrors('startDate')" />
              </div>
              <div>
                <label :for="anchors.endDate" class="field-label">
                  Date de fin <span class="font-normal text-ink-600">(facultatif)</span>
                </label>
                <p id="end-hint" class="mt-0.5 text-sm text-ink-600">
                  Sans date de fin : {{ RULES.regularMaxDurationMonths }} mois, renouvelable
                </p>
                <input
                  :id="anchors.endDate"
                  v-model="drafts.draft.endDate"
                  type="date"
                  :min="drafts.draft.startDate || earliestRegularStart"
                  :aria-invalid="invalid('endDate') || undefined"
                  :aria-describedby="describedBy('endDate', 'end-hint')"
                  class="field-input mt-1.5"
                />
                <FieldError id="endDate-error" :messages="fieldErrors('endDate')" />
              </div>
            </div>
          </div>
        </section>

        <section class="card space-y-6 p-4 sm:p-6" aria-labelledby="details-title">
          <h2 id="details-title" class="text-lg font-semibold text-ink-900">Précisions</h2>

          <fieldset
            v-if="type === 'exceptional'"
            :id="anchors.reason"
            :aria-describedby="describedBy('reason')"
          >
            <legend class="text-sm font-medium text-ink-900">
              Motif <span class="font-normal text-ink-600">(obligatoire)</span>
            </legend>
            <div class="mt-2 grid gap-2 sm:grid-cols-2">
              <label
                v-for="reason in reasons"
                :key="reason"
                class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-ink-200 px-3 hover:border-ink-400 has-checked:border-ink-900 has-checked:ring-1 has-checked:ring-ink-900"
              >
                <input
                  v-model="drafts.draft.reason"
                  type="radio"
                  name="reason"
                  :value="reason"
                  class="size-4 accent-ink-900"
                />
                <span class="text-sm text-ink-900">{{ REASONS[reason] }}</span>
              </label>
            </div>
            <FieldError id="reason-error" :messages="fieldErrors('reason')" />
          </fieldset>

          <div>
            <label :for="anchors.comment" class="field-label">
              Message pour {{ portal.manager ? portal.manager.firstName : 'votre manager' }}
              <span class="font-normal text-ink-600">
                ({{
                  type === 'exceptional' && drafts.draft.reason === 'other'
                    ? 'obligatoire'
                    : 'facultatif'
                }})
              </span>
            </label>
            <textarea
              :id="anchors.comment"
              v-model="drafts.draft.comment"
              rows="3"
              :aria-invalid="invalid('comment') || undefined"
              :aria-describedby="describedBy('comment', 'comment-count')"
              class="field-input mt-1.5"
            />
            <p
              id="comment-count"
              class="mt-1 text-right text-sm"
              :class="
                drafts.draft.comment.length > RULES.commentMaxLength
                  ? 'font-medium text-brand-700'
                  : 'text-ink-600'
              "
            >
              {{ drafts.draft.comment.length }} / {{ RULES.commentMaxLength }} caractères
            </p>
            <FieldError id="comment-error" :messages="fieldErrors('comment')" />
          </div>

          <div v-if="type === 'exceptional'">
            <span class="field-label">
              Justificatif <span class="font-normal text-ink-600">(facultatif)</span>
            </span>
            <p id="attachment-hint" class="mt-0.5 text-sm text-ink-600">
              {{ ATTACHMENT_LABEL }}, {{ formatBytes(RULES.attachmentMaxBytes) }} maximum. Exemple :
              préavis de grève.
            </p>
            <div
              v-if="drafts.draft.attachment"
              class="mt-2 flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2"
            >
              <FileText class="size-5 shrink-0 text-ink-600" aria-hidden="true" />
              <span class="min-w-0 flex-1 text-sm">
                <span class="block truncate text-ink-900">{{ drafts.draft.attachment.name }}</span>
                <span class="block text-ink-600">{{
                  formatBytes(drafts.draft.attachment.size)
                }}</span>
              </span>
              <button
                type="button"
                class="grid size-10 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
                :aria-label="`Retirer ${drafts.draft.attachment.name}`"
                @click="removeFile"
              >
                <X class="size-4" aria-hidden="true" />
              </button>
            </div>
            <label
              v-else
              class="mt-2 flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-400 px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50 has-focus-visible:outline-3 has-focus-visible:outline-info-700"
            >
              <Paperclip class="size-4" aria-hidden="true" />
              Ajouter un fichier
              <input
                :id="anchors.attachment"
                ref="fileInput"
                type="file"
                :accept="ATTACHMENT_ACCEPT"
                class="sr-only"
                :aria-describedby="describedBy('attachment', 'attachment-hint')"
                :aria-invalid="invalid('attachment') || undefined"
                @change="onFile"
              />
            </label>
            <FieldError id="attachment-error" :messages="fieldErrors('attachment')" />
          </div>

          <div :id="anchors.charter">
            <div
              v-if="portal.charterAccepted"
              class="text-sm text-ink-700 sm:flex sm:flex-wrap sm:items-center sm:gap-x-2"
            >
              <p class="flex items-start gap-2">
                <CircleCheck class="mt-0.5 size-4 shrink-0 text-success-700" aria-hidden="true" />
                <span>
                  Charte du télétravail {{ RULES.charterVersion }} acceptée le
                  {{ formatDateTime(portal.currentUser.charterAcceptedAt!) }}.
                </span>
              </p>
              <button
                type="button"
                class="mt-1 ml-6 inline-flex min-h-10 items-center font-semibold underline underline-offset-2 sm:mt-0 sm:ml-0"
                @click="charterOpen = true"
              >
                La relire
              </button>
            </div>
            <template v-else>
              <label for="charter-checkbox" class="flex min-h-10 cursor-pointer items-start gap-3">
                <input
                  id="charter-checkbox"
                  v-model="drafts.draft.charterAccepted"
                  type="checkbox"
                  class="check mt-2.5 shrink-0"
                  aria-required="true"
                  :aria-invalid="invalid('charter') || undefined"
                  :aria-describedby="describedBy('charter')"
                />
                <span class="py-2 text-sm text-ink-900">
                  J’ai lu et j’accepte la charte du télétravail ({{ RULES.charterVersion }}). Je ne
                  la reverrai plus pour mes prochaines demandes.
                </span>
              </label>
              <button
                type="button"
                class="ml-8 inline-flex min-h-10 items-center text-sm font-semibold underline underline-offset-2"
                @click="charterOpen = true"
              >
                Lire la charte
              </button>
              <FieldError id="charter-error" :messages="fieldErrors('charter')" />
            </template>
          </div>
        </section>
      </div>

      <!-- Barre d'envoi fixe sur téléphone ; le bouton est dans le récapitulatif sur grand écran. -->
      <div
        data-action-bar
        class="sticky bottom-0 z-20 -mx-4 flex items-center gap-3 border-t border-ink-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgb(0_0_0/0.06)] sm:-mx-6 sm:px-6 lg:hidden [@media(max-height:30rem)]:static"
      >
        <p aria-hidden="true" class="min-w-0 flex-1 text-sm leading-snug text-ink-700">
          <span class="block font-semibold text-ink-900">{{ barTitle }}</span>
          <span
            v-if="barDetail"
            class="block"
            :class="type === 'occasional' && balanceAfter < 0 ? 'font-medium text-brand-700' : ''"
          >
            {{ barDetail }}
          </span>
        </p>
        <AppButton type="submit" size="lg" class="shrink max-[22rem]:max-w-44">
          <Send class="size-4 shrink-0" aria-hidden="true" />
          Envoyer la demande
        </AppButton>
      </div>

      <div class="space-y-4 lg:sticky lg:top-6">
        <aside aria-labelledby="recap-title" class="card space-y-4 p-4 sm:p-5">
          <h2 id="recap-title" class="text-lg font-semibold text-ink-900">Récapitulatif</h2>
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="text-ink-600">Type</dt>
              <dd class="font-medium text-ink-900">{{ REQUEST_TYPES[type].label }}</dd>
            </div>
            <div>
              <dt class="text-ink-600">{{ type === 'regular' ? 'Rythme' : 'Dates' }}</dt>
              <dd class="font-medium text-ink-900 first-letter:uppercase">
                {{ describeSchedule(draft) }}
              </dd>
            </div>
            <div>
              <dt class="text-ink-600">Durée</dt>
              <dd class="font-medium text-ink-900">{{ describeQuantity(draft) }}</dd>
            </div>
            <div v-if="type === 'occasional'">
              <dt class="text-ink-600">Solde après la demande</dt>
              <dd class="font-medium" :class="balanceAfter < 0 ? 'text-brand-700' : 'text-ink-900'">
                {{
                  balanceAfter < 0
                    ? `Dépassement de ${formatDays(-balanceAfter)}`
                    : formatDays(balanceAfter)
                }}
              </dd>
            </div>
            <div>
              <dt class="text-ink-600">Validation par</dt>
              <dd class="font-medium text-ink-900">
                {{ portal.manager ? fullName(portal.manager) : 'Service RH' }}
              </dd>
            </div>
          </dl>
          <div class="space-y-2 border-t border-ink-200 pt-4">
            <div class="max-lg:hidden">
              <AppButton type="submit" size="lg" block>
                <Send class="size-4" aria-hidden="true" />
                Envoyer la demande
              </AppButton>
            </div>
            <AppButton variant="ghost" block @click="leave">Annuler</AppButton>
          </div>
          <div class="space-y-1 text-sm text-ink-600">
            <p>
              {{
                drafts.savedAt
                  ? `Brouillon enregistré à ${formatTime(drafts.savedAt)}.`
                  : 'Rien à enregistrer pour l’instant.'
              }}
            </p>
            <button
              v-if="drafts.dirty"
              type="button"
              class="-ml-1 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-ink-700 underline underline-offset-2 hover:text-ink-900"
              @click="resetOpen = true"
            >
              <RotateCcw class="size-4" aria-hidden="true" />
              Repartir de zéro
            </button>
          </div>
        </aside>

        <section aria-labelledby="identity-title" class="card space-y-3 p-4 sm:p-5">
          <h2 id="identity-title" class="text-lg font-semibold text-ink-900">Vos informations</h2>
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="text-ink-600">Nom</dt>
              <dd class="font-medium text-ink-900">{{ fullName(portal.currentUser) }}</dd>
            </div>
            <div>
              <dt class="text-ink-600">Matricule</dt>
              <dd class="font-medium text-ink-900">{{ portal.currentUser.matricule }}</dd>
            </div>
            <div>
              <dt class="text-ink-600">Équipe</dt>
              <dd class="font-medium text-ink-900">{{ portal.currentUser.team }}</dd>
            </div>
            <div>
              <dt class="text-ink-600">Centre de coût</dt>
              <dd class="font-medium text-ink-900">{{ portal.currentUser.costCenter }}</dd>
            </div>
            <div>
              <dt class="text-ink-600">Manager</dt>
              <dd class="font-medium text-ink-900">
                {{ portal.manager ? fullName(portal.manager) : 'Aucun manager renseigné' }}
              </dd>
            </div>
          </dl>
          <p class="text-sm text-ink-600">
            Une erreur ? Écrivez à
            <a
              :href="`mailto:${CONTACT.email}`"
              class="font-medium text-ink-900 underline underline-offset-2"
              >{{ CONTACT.email }}</a
            >.
          </p>
        </section>
      </div>
    </form>

    <ConfirmDialog
      v-model:open="resetOpen"
      title="Effacer votre saisie ?"
      description="Le formulaire et le brouillon enregistré seront vidés. Cette action est définitive."
      confirm-label="Effacer ma saisie"
      cancel-label="Garder ma saisie"
      tone="danger"
      @confirm="startOver"
    />
    <ConfirmDialog
      v-model:open="cancelOpen"
      title="Abandonner cette demande ?"
      description="Votre brouillon sera supprimé. Cette action est définitive."
      confirm-label="Abandonner"
      cancel-label="Continuer la saisie"
      tone="danger"
      @confirm="discard"
    />

    <DialogRoot v-model:open="charterOpen">
      <DialogPortal>
        <DialogOverlay class="dialog-overlay" />
        <DialogContent class="dialog-panel max-h-[85dvh] max-w-lg">
          <DialogTitle class="text-lg font-semibold text-ink-900">
            Charte du télétravail ({{ RULES.charterVersion }}) : l’essentiel
          </DialogTitle>
          <DialogDescription class="mt-1 text-sm text-ink-600">
            Lisez ces règles avant de l’accepter. Elles sont aussi sur la page de la charte.
          </DialogDescription>
          <CharterContent class="mt-4 text-sm" />
          <DialogClose as-child>
            <AppButton class="mt-6" block>J’ai compris</AppButton>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<style>
/* Évite que la barre fixe cache le champ focalisé. */
@media (max-width: 63.99rem) and (min-height: 30.01rem) {
  html:has([data-action-bar]) {
    scroll-padding-bottom: 6rem;
  }
}
</style>
