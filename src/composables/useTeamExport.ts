import type { Ref } from 'vue'

import { useToast } from '@/composables/useToast'
import type { ISODate } from '@/domain/dates'
import { formatShort } from '@/domain/dateFormat'
import { planningCsv } from '@/domain/export'
import { plural } from '@/domain/format'
import type { PlanningRow } from '@/domain/teamPlanning'
import { fullName } from '@/domain/types'
import { downloadText } from '@/services/download'

// Export CSV et impression du planning de la semaine affichée.
export function useTeamExport(
  rows: Ref<readonly PlanningRow[]>,
  weekDays: Ref<readonly ISODate[]>,
  weekNumber: Ref<number>,
) {
  const { show } = useToast()

  /* Export : toute la sélection filtrée, pas seulement la page affichée. */
  function exportPlanning() {
    const csv = planningCsv(
      weekDays.value.map((d) => formatShort(d)),
      rows.value.map((r) => ({
        name: fullName(r.member),
        jobTitle: r.member.jobTitle,
        team: r.member.team,
        cells: r.cells.map((c) => c.label),
      })),
    )
    downloadText(`presence-equipe-semaine-${weekNumber.value}.csv`, csv)
    show('Planning exporté', {
      description: `${rows.value.length} ${plural(rows.value.length, 'collaborateur')}, semaine ${weekNumber.value}.`,
      tone: 'info',
    })
  }
  const printPlanning = () => window.print()

  return { exportPlanning, printPlanning }
}
