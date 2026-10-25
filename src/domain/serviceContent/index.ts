import type { ISODate } from '../dates'
import { ABSENCES_SERVICES } from './absences'
import { CAREER_SERVICES } from './career'
import { DOCUMENTS_SERVICES } from './documents'
import type { ServiceContent } from './helpers'
import { PAY_SERVICES } from './pay'

export type { ServiceContent } from './helpers'

const MAKERS: Record<string, (today: ISODate) => ServiceContent> = {
  ...PAY_SERVICES,
  ...ABSENCES_SERVICES,
  ...DOCUMENTS_SERVICES,
  ...CAREER_SERVICES,
}

export function serviceContent(slug: string, today: ISODate): ServiceContent | undefined {
  return MAKERS[slug]?.(today)
}
