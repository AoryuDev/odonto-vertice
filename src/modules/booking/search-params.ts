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

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(single, schema.optional().catch(undefined))

const searchSchema = z.object({
  tratamento: optional(slugSchema),
  dentista: optional(z.union([z.literal(ANY_DENTIST), slugSchema])),
  data: optional(z.string().refine(isLocalDate)),
  horario: optional(z.iso.datetime({ offset: true })),
})

export function parseBookingSearch(
  raw: Record<string, string | string[] | undefined>,
): BookingSelection {
  const parsed = searchSchema.parse(raw)
  return {
    treatment: parsed.tratamento,
    dentist: parsed.dentista,
    date: parsed.data as LocalDate | undefined,
    start: parsed.horario,
  }
}

export function currentStep(selection: BookingSelection): BookingStep {
  if (!selection.treatment) return 'treatment'
  if (!selection.dentist) return 'dentist'
  if (!selection.start) return 'slot'
  return 'details'
}

export function bookingHref(selection: BookingSelection): string {
  const params = new URLSearchParams()
  if (selection.treatment) params.set('tratamento', selection.treatment)
  if (selection.dentist) params.set('dentista', selection.dentist)
  if (selection.date) params.set('data', selection.date)
  if (selection.start) params.set('horario', selection.start)
  const query = params.toString()
  return query ? `/agendar?${query}` : '/agendar'
}
