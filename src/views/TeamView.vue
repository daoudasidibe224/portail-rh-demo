<script setup lang="ts">
import { nextTick, ref } from 'vue'

import TeamHeader from '@/components/team/TeamHeader.vue'
import TeamPendingList from '@/components/team/TeamPendingList.vue'
import TeamRejectDialog from '@/components/team/TeamRejectDialog.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { useToast } from '@/composables/useToast'
import { fullName, type TeleworkRequest } from '@/domain/types'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const heading = usePageHeading()
const { show } = useToast()

const listTitle = ref<HTMLElement | null>(null)
const rejecting = ref<TeleworkRequest | null>(null)

function authorName(request: TeleworkRequest) {
  const employee = portal.employeeById(request.employeeId)
  return employee ? fullName(employee) : 'Collaborateur inconnu'
}

// La demande décidée quitte la liste, et son bouton avec elle : le focus revient au titre.
async function focusList(afterDialog = false) {
  await nextTick()
  // Le dialogue rend d'abord le focus à son déclencheur, qui n'existe plus.
  if (afterDialog) setTimeout(() => listTitle.value?.focus(), 0)
  else listTitle.value?.focus()
}

function approve(request: TeleworkRequest) {
  portal.approve(request.id)
  show(`Demande de ${authorName(request)} validée`)
  void focusList()
}

function reject(comment: string) {
  const request = rejecting.value
  if (!request) return
  portal.reject(request.id, comment)
  show(`Demande de ${authorName(request)} refusée`, { tone: 'info' })
  void focusList(true)
}
</script>

<template>
  <div class="space-y-6">
    <TeamHeader
      ref="heading"
      :member-count="portal.teamMembers.length"
      :pending-count="portal.teamPending.length"
    />

    <section class="card overflow-hidden" aria-labelledby="pending-title">
      <h2
        id="pending-title"
        ref="listTitle"
        tabindex="-1"
        class="border-b border-ink-200 px-4 py-3 text-lg font-semibold text-ink-900 sm:px-5"
      >
        À valider
      </h2>
      <TeamPendingList
        :requests="portal.teamPending"
        :name-of="authorName"
        @approve="approve"
        @reject="rejecting = $event"
      />
    </section>

    <TeamRejectDialog
      :open="rejecting !== null"
      :author-name="rejecting ? authorName(rejecting) : ''"
      @update:open="(open) => !open && (rejecting = null)"
      @confirm="reject"
    />
  </div>
</template>
