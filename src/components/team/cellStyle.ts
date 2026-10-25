import { Building2, Hourglass, Laptop } from 'lucide-vue-next'

import type { PlanningCellKind } from '@/domain/teamPlanning'

export const cellStyle: Record<PlanningCellKind, { icon: typeof Building2 | null; cls: string }> = {
  office: { icon: Building2, cls: 'text-ink-600' },
  remote: { icon: Laptop, cls: 'bg-success-50 text-success-700' },
  pending: { icon: Hourglass, cls: 'bg-warning-50 text-warning-700' },
  holiday: { icon: null, cls: 'bg-ink-100 text-ink-600' },
}
