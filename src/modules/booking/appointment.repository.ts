import 'server-only'
import { createServiceClient } from '@/lib/supabase/clients'
import type { Database } from '@/lib/supabase/database.types'
import { hashManageToken } from './manage-token'

export type AppointmentStatus = Database['public']['Enums']['appointment_status']

export type AppointmentDetails = {
  readonly id: string
  readonly status: AppointmentStatus
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
  'id, status, period, payment_method, insurance_provider, rescheduled_count, treatments!inner(id, slug, name), dentists!inner(id, slug, display_name), patients!inner(full_name, email, phone)'

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
  period: unknown
  payment_method: AppointmentDetails['paymentMethod']
  insurance_provider: string | null
  rescheduled_count: number
  treatments: { id: string; slug: string; name: string }
  dentists: { id: string; slug: string; display_name: string }
  patients: { full_name: string; email: string; phone: string }
}

function toDetails(row: DetailsRow): AppointmentDetails {
  const { start, end } = parsePeriod(row.period)
  return {
    id: row.id,
    status: row.status,
    startsAt: start,
    endsAt: end,
    paymentMethod: row.payment_method,
    insuranceProvider: row.insurance_provider,
    rescheduledCount: row.rescheduled_count,
    treatment: row.treatments,
    dentist: {
      id: row.dentists.id,
      slug: row.dentists.slug,
      displayName: row.dentists.display_name,
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
    .maybeSingle()
  if (error) throw new Error(`Failed to load appointment: ${error.message}`)
  return data ? toDetails(data as DetailsRow) : undefined
}

export async function findAppointmentByToken(
  token: string,
): Promise<AppointmentDetails | undefined> {
  const { data, error } = await createServiceClient()
    .from('appointments')
    .select(DETAILS_COLUMNS)
    .eq('manage_token_hash', hashManageToken(token))
    .maybeSingle()
  if (error) throw new Error(`Failed to load appointment: ${error.message}`)
  return data ? toDetails(data as DetailsRow) : undefined
}
