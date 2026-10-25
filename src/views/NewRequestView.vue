<script setup lang="ts">
import { ANCHORS } from '@/components/request/anchors'
import DraftStatusBar from '@/components/request/DraftStatusBar.vue'
import ErrorSummary from '@/components/request/ErrorSummary.vue'
import MobileActionBar from '@/components/request/MobileActionBar.vue'
import RequestDialogs from '@/components/request/RequestDialogs.vue'
import RequestNavButtons from '@/components/request/RequestNavButtons.vue'
import RequestStepper from '@/components/request/RequestStepper.vue'
import RequestSummary from '@/components/request/RequestSummary.vue'
import RestoredNotice from '@/components/request/RestoredNotice.vue'
import StepCard from '@/components/request/StepCard.vue'
import PageTitle from '@/components/ui/PageTitle.vue'
import { useDraftActions } from '@/composables/useDraftActions'
import { usePageHeading } from '@/composables/usePageHeading'
import { useRequestPrefill } from '@/composables/useRequestPrefill'
import { useRequestStepper } from '@/composables/useRequestStepper'
import { useRequestSubmission } from '@/composables/useRequestSubmission'

const heading = usePageHeading()

useRequestPrefill()
// `stepCard` et `summary` sont liés aux composants du gabarit par leur nom.
const { step, reached, isLast, stepCard, summary, visibleErrors, currentAttempt, ...stepper } =
  useRequestStepper()
const { sendOpen, newsletter, sendSummary, send } = useRequestSubmission(stepper.showErrors)
const { cancelOpen, resetOpen, leave, discard, startOver, print } = useDraftActions(
  stepper.restart,
  () => heading.value?.focus(),
)
</script>

<template>
  <div>
    <PageTitle ref="heading">Nouvelle demande de télétravail</PageTitle>
    <p class="mt-2 text-ink-700">
      Votre saisie est enregistrée au fur et à mesure : vous pouvez la reprendre plus tard.
    </p>
    <RestoredNotice v-if="step === 0" />

    <div class="mt-4">
      <RequestStepper :current="step" :reached="reached" @go="stepper.jump" />
    </div>

    <form
      class="mt-3 flex flex-col gap-6 lg:grid lg:items-start"
      :class="isLast ? 'lg:max-w-3xl' : 'lg:grid-cols-[1fr_18rem]'"
      novalidate
      @submit.prevent="stepper.advance(() => (sendOpen = true))"
    >
      <div class="min-w-0 space-y-6">
        <ErrorSummary
          :key="step"
          ref="summary"
          :errors="visibleErrors"
          :attempt="currentAttempt"
          :anchors="ANCHORS"
        />
        <StepCard
          ref="stepCard"
          v-model:newsletter="newsletter"
          :step="step"
          :errors="visibleErrors"
          :printable="isLast"
        />
        <RequestNavButtons :step="step" :is-last="isLast" @back="stepper.back" @cancel="leave" />
      </div>

      <MobileActionBar :step="step" :is-last="isLast" @back="stepper.back" />

      <aside
        v-if="!isLast"
        aria-labelledby="recap-title"
        class="card space-y-3 p-4 max-lg:hidden sm:p-5 lg:sticky lg:top-6 print:hidden"
      >
        <h2 id="recap-title" class="text-lg font-semibold text-ink-900">Récapitulatif</h2>
        <RequestSummary />
      </aside>
    </form>

    <DraftStatusBar :is-last="isLast" @leave="leave" @reset="resetOpen = true" @print="print" />

    <RequestDialogs
      v-model:send-open="sendOpen"
      v-model:reset-open="resetOpen"
      v-model:cancel-open="cancelOpen"
      :send-summary="sendSummary"
      @send="send"
      @reset="startOver"
      @discard="discard"
    />
  </div>
</template>
