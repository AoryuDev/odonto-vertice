import 'server-only'
import type { AppLocale } from '@/i18n/routing'
import { pickTranslation } from '@/i18n/translations'
import { createServiceClient } from '@/lib/supabase/clients'
import type { Database } from '@/lib/supabase/database.types'
import { hashManageToken } from './manage-token'

export type AppointmentStatus = Database['public']['Enums']['appointment_status']

export type AppointmentDetails = {
  readonly id: string
  readonly status: AppointmentStatus
  readonly locale: AppLocale
  readonly startsAt: Date
  readonly endsAt: Date
  readonly paymentMethod: Database['public']['Enums']['payment_method']
  readonly insuranceProvider: string | null
  readonly rescheduledCount: number
  readonly treatment: { readonly id: string; readonly slug: string; readonly name: string }
  readonly dentist: { readonly id: string; readonly slug: string; readonly displayName: string }
  readonly patient: { readonly fullName: string; readonly email: string; readonly phone: string }
}

const DETAILS_COLUMNS =
  'id, status, locale, period, payment_method, insurance_provider, rescheduled_count, treatments!inner(id, slug, treatment_translations(locale, name)), dentists!inner(id, slug, dentist_translations(locale, display_name)), patients!inner(full_name, email, phone)'

export function parsePeriod(period: unknown): { start: Date; end: Date } {
  const match = /^\[\"?([^",]+)\"?,\"?([^"\)]+)\"?\)$/.exec(String(period))
  if (!match?.[1] || !match[2]) throw new Error(`Unexpected period format: ${String(period)}`)
  return { start: new Date(match[1]), end: new Date(match[2]) }
}

export function toPeriodLiteral(start: Date, end: Date): string {
  return `[${start.toISOString()},${end.toISOString()})`
}

type DetailsRow = {
  id: string
  status: AppointmentStatus
  locale: AppLocale
  period: unknown
  payment_method: AppointmentDetails['paymentMethod']
  insurance_provider: string | null
  rescheduled_count: number
  treatments: {
    id: string
    slug: string
    treatment_translations: { locale: string; name: string }[]
  }
  dentists: {
    id: string
    slug: string
    dentist_translations: { locale: string; display_name: string }[]
  }
  patients: { full_name: string; email: string; phone: string }
}

function toDetails(row: DetailsRow, displayLocale: AppLocale): AppointmentDetails {
  const { start, end } = parsePeriod(row.period)
  return {
    id: row.id,
    status: row.status,
    locale: row.locale,
    startsAt: start,
    endsAt: end,
    paymentMethod: row.payment_method,
    insuranceProvider: row.insurance_provider,
    rescheduledCount: row.rescheduled_count,
    treatment: {
      id: row.treatments.id,
      slug: row.treatments.slug,
      name: pickTranslation(row.treatments.treatment_translations, displayLocale)?.name ?? '',
    },
    dentist: {
      id: row.dentists.id,
      slug: row.dentists.slug,
      displayName:
        pickTranslation(row.dentists.dentist_translations, displayLocale)?.display_name ?? '',
    },
    patient: {
      fullName: row.patients.full_name,
      email: row.patients.email,
      phone: row.patients.phone,
    },
  }
}

export async function findAppointmentById(id: string): Promise<AppointmentDetails | undefined> {
  const { data, error } = await createServiceClient()
    .from('appointments')
    .select(DETAILS_COLUMNS)
    .eq('id', id)
    .maybeSingle<DetailsRow>()
  if (error) throw new Error(`Failed to load appointment: ${error.message}`)
  return data ? toDetails(data, data.locale) : undefined
}

export async function findAppointmentByToken(
  token: string,
  displayLocale?: AppLocale,
): Promise<AppointmentDetails | undefined> {
  const { data, error } = await createServiceClient()
    .from('appointments')
    .select(DETAILS_COLUMNS)
    .eq('manage_token_hash', hashManageToken(token))
    .maybeSingle<DetailsRow>()
  if (error) throw new Error(`Failed to load appointment: ${error.message}`)
  return data ? toDetails(data, displayLocale ?? data.locale) : undefined
}
