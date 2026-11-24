import { z } from 'zod'
import { isLocalDate, type LocalDate } from '@/modules/schedule/domain/clinic-time'
import { ANY_DENTIST, slugSchema } from './schemas'

export type BookingStep = 'treatment' | 'dentist' | 'slot' | 'details'

export type BookingSelection = {
  readonly treatment?: string
  readonly dentist?: string
  readonly date?: LocalDate
  readonly start?: string
}

const single = (value: unknown) => (Array.isArray(value) ? value[0] : value)

export const dentistParamSchema = z.union([z.literal(ANY_DENTIST), slugSchema])

export function isTreatmentParam(value: string): boolean {
  return slugSchema.safeParse(value).success
}

export function isDentistParam(value: string): boolean {
  return dentistParamSchema.safeParse(value).success
}

export function parseDateParam(raw: unknown): LocalDate | undefined {
  const value = single(raw)
  return typeof value === 'string' && isLocalDate(value) ? value : undefined
}

export function parseStartParam(raw: unknown): string | undefined {
  const parsed = z.iso.datetime({ offset: true }).safeParse(single(raw))
  return parsed.success ? parsed.data : undefined
}

export function bookingHref(selection: BookingSelection): string {
  if (!selection.treatment) return '/agendar'
  const treatment = encodeURIComponent(selection.treatment)
  if (!selection.dentist) return `/agendar/${treatment}`
  const base = `/agendar/${treatment}/${encodeURIComponent(selection.dentist)}`
  if (selection.start) return `${base}/dados?horario=${encodeURIComponent(selection.start)}`
  return selection.date ? `${base}?data=${selection.date}` : base
}
