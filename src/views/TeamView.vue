<script setup lang="ts">
import { TabsContent, TabsRoot } from 'reka-ui'
import { ref } from 'vue'

import TeamBulkApproveDialog from '@/components/team/TeamBulkApproveDialog.vue'
import TeamHeader from '@/components/team/TeamHeader.vue'
import TeamPendingTab from '@/components/team/TeamPendingTab.vue'
import TeamPresenceTab from '@/components/team/TeamPresenceTab.vue'
import TeamRejectDialog from '@/components/team/TeamRejectDialog.vue'
import TeamTabList from '@/components/team/TeamTabList.vue'
import { usePageHeading } from '@/composables/usePageHeading'
import { useTeamDecisions } from '@/composables/useTeamDecisions'
import { useTeamExport } from '@/composables/useTeamExport'
import { MEMBERS_PER_PAGE, useTeamPresence } from '@/composables/useTeamPresence'
import { useTeamPending } from '@/composables/useTeamPending'
import { useTeamSelection } from '@/composables/useTeamSelection'
import { usePortalStore } from '@/stores/portal'

const portal = usePortalStore()
const heading = usePageHeading()
const tabList = ref<{ focusPending: () => void } | null>(null)
const tab = ref(portal.teamPending.length ? 'pending' : 'presence')

const pending = useTeamPending()
const selection = useTeamSelection(
  pending.list,
  pending.pager.visible,
  pending.filters,
  pending.authorName,
)
const decisions = useTeamDecisions(() => tabList.value?.focusPending())
const presence = useTeamPresence()
const planningExport = useTeamExport(presence.filteredRows, presence.weekDays, presence.weekNumber)

function approveSelected() {
  decisions.approveMany(selection.bulkRequests.value)
  selection.clear()
}
</script>

<template>
  <div class="space-y-6">
    <TeamHeader
      ref="heading"
      :member-count="portal.teamMembers.length"
      :pending-count="portal.teamPending.length"
    />

    <TabsRoot v-model="tab" class="card overflow-hidden">
      <TeamTabList ref="tabList" :pending-count="portal.teamPending.length" />

      <TabsContent value="pending" class="focus-visible:outline-none">
        <TeamPendingTab
          v-model:filters="pending.filters.value"
          :empty="!portal.teamPending.length"
          :filters-visible="pending.filtersVisible.value"
          :results-label="pending.resultsLabel.value"
          :pager="pending.pager"
          :page-requests="pending.pager.visible.value"
          :selected="selection.selected.value"
          :can-select-all="selection.canSelectAll.value"
          :name-of="pending.authorName"
          :remote="pending.remoteFor"
          @toggle="selection.toggleOne"
          @toggle-page="selection.togglePage"
          @approve="decisions.approve"
          @reject="decisions.rejecting.value = $event"
          @approve-selected="selection.bulkOpen.value = true"
          @clear-selection="selection.clear"
          @select-all="selection.selectAll"
        />
      </TabsContent>

      <TabsContent value="presence" class="focus-visible:outline-none">
        <TeamPresenceTab
          v-model:query="presence.memberQuery.value"
          v-model:team="presence.teamFilter.value"
          :rows="presence.pager.visible.value"
          :filtered-count="presence.filteredRows.value.length"
          :member-count="portal.teamMembers.length"
          :per-page="MEMBERS_PER_PAGE"
          :teams="presence.teams.value"
          :week-days="presence.weekDays.value"
          :week-number="presence.weekNumber.value"
          :today="portal.today"
          :remote-count="presence.remoteCount"
          :pager="presence.pager"
          @previous="presence.weekOffset.value--"
          @next="presence.weekOffset.value++"
          @export="planningExport.exportPlanning"
          @print="planningExport.printPlanning"
        />
      </TabsContent>
    </TabsRoot>

    <TeamBulkApproveDialog
      v-model:open="selection.bulkOpen.value"
      :title="selection.bulkTitle.value"
      :names="selection.bulkDescription.value"
      :count="selection.bulkRequests.value.length"
      @confirm="approveSelected"
    />
    <TeamRejectDialog
      v-model:open="decisions.rejectOpen.value"
      :author-name="decisions.rejecting.value ? pending.authorName(decisions.rejecting.value) : ''"
      @confirm="decisions.reject"
    />
  </div>
</template>
