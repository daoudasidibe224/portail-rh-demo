<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import PeriodChoice from '@/components/request/PeriodChoice.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { formatLong, nextBusinessDay } from '@/domain/dates'
import { formatDays } from '@/domain/format'
import { PERIODS } from '@/domain/rules'
import { emptyDraft, fullName, type DayPeriod } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

import { DEFAULT_PERIOD } from './defaults'

const portal = usePortalStore()
const router = useRouter()
const { show } = useToast()

// Plus petite demande possible : si elle est refusée, aucune ne passera.
const HALF_DAY: DayPeriod = 'am'

// Raccourci « jour ouvré suivant » : deux clics au lieu d'un formulaire complet.
const quickDate = computed(() => nextBusinessDay(portal.today))
// PeriodChoice peut renvoyer null (option « Sur site »), absente ici.
const quickChoice = ref<DayPeriod | null>(DEFAULT_PERIOD)
const quickPeriod = computed(() => quickChoice.value ?? DEFAULT_PERIOD)
const quickOpen = ref(false)
const quickDraft = computed(() => ({
  ...emptyDraft('occasional'),
  days: [{ date: quickDate.value, period: quickPeriod.value }],
}))
const quickBlocker = computed(() => {
  if (!portal.charterAccepted) return null
  const errors = portal.validate({
    ...quickDraft.value,
    days: [{ date: quickDate.value, period: HALF_DAY }],
  })
  return errors[0]?.message ?? null
})
const balanceAfter = computed(() => portal.balance.available - PERIODS[quickPeriod.value].weight)

function openQuick() {
  if (!portal.charterAccepted) {
    router.push({ name: 'new-request', query: { type: 'occasional', date: quickDate.value } })
    return
  }
  quickChoice.value = DEFAULT_PERIOD
  quickOpen.value = true
}

function submitQuick() {
  try {
    const request = portal.submit(quickDraft.value)
    show('Demande envoyée', {
      description: `${portal.manager ? fullName(portal.manager) : 'Votre manager'} a été notifié(e). Réf. ${request.reference}.`,
    })
  } catch (error) {
    show('La demande n’a pas pu être envoyée', {
      tone: 'error',
      description: error instanceof Error ? error.message : undefined,
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row">
    <AppButton v-if="!quickBlocker" size="lg" @click="openQuick">
      Télétravailler {{ formatLong(quickDate) }}
    </AppButton>
    <AppButton
      size="lg"
      :variant="quickBlocker ? 'primary' : 'secondary'"
      :to="{ name: 'new-request' }"
    >
      Nouvelle demande
    </AppButton>

    <ConfirmDialog
      v-model:open="quickOpen"
      :title="`Télétravailler ${formatLong(quickDate)} ?`"
      :description="`Demande occasionnelle, envoyée à ${portal.manager ? fullName(portal.manager) : 'votre manager'} pour validation.`"
      confirm-label="Envoyer la demande"
      @confirm="submitQuick"
    >
      <PeriodChoice v-model="quickChoice" class="mt-4" legend="Durée" name="quick-period" />
      <p class="mt-3 text-sm text-ink-700">
        Solde après la demande : <strong>{{ formatDays(Math.max(0, balanceAfter)) }}</strong>
      </p>
    </ConfirmDialog>
  </div>
</template>
