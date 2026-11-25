import 'server-only'
import type { AppLocale } from '@/i18n/routing'
import { pickTranslation, translationLocales } from '@/i18n/translations'
import type { Db } from '@/lib/supabase/clients'
import { parsePeriod } from '@/modules/booking/appointment.repository'
import type { AgendaAppointment, AgendaBlock, AgendaEntry, AppointmentStatus } from './agenda'

export type StaffAppointment = AgendaAppointment & {
  readonly treatment: { readonly id: string; readonly slug: string; readonly name: string }
  readonly dentist: { readonly id: string; readonly slug: string; readonly displayName: string }
  readonly patient: { readonly fullName: string; readonly email: string; readonly phone: string }
  readonly notes: string | null
  readonly source: 'website' | 'reception'
  readonly rescheduledCount: number
  readonly cancellationReason: string | null
  readonly createdAt: Date
}

function rangeLiteral(from: Date, to: Date): string {
  return `[${from.toISOString()},${to.toISOString()})`
}

type NameRow = { readonly locale: string; readonly name: string }
type DisplayNameRow = { readonly locale: string; readonly display_name: string }

function treatmentName(rows: readonly NameRow[], locale: AppLocale): string {
  return pickTranslation(rows, locale)?.name ?? ''
}

function dentistName(rows: readonly DisplayNameRow[], locale: AppLocale): string {
  return pickTranslation(rows, locale)?.display_name ?? ''
}

export async function listAgenda(
  db: Db,
  options: { from: Date; to: Date; dentistIds?: readonly string[]; locale: AppLocale },
): Promise<AgendaEntry[]> {
  const range = rangeLiteral(options.from, options.to)
  let appointments = db
    .from('appointments')
    .select(
      'id, dentist_id, period, status, payment_method, insurance_provider, locale, patients!inner(full_name), treatments!inner(treatment_translations(locale, name))',
    )
    .overlaps('period', range)
    .in('treatments.treatment_translations.locale', translationLocales(options.locale))
  let blocks = db
    .from('schedule_blocks')
    .select('id, dentist_id, period, reason')
    .overlaps('period', range)
  if (options.dentistIds) {
    appointments = appointments.in('dentist_id', [...options.dentistIds])
    blocks = blocks.in('dentist_id', [...options.dentistIds])
  }

  const [appointmentResult, blockResult] = await Promise.all([appointments, blocks])
  if (appointmentResult.error)
    throw new Error(`Failed to load agenda: ${appointmentResult.error.message}`)
  if (blockResult.error) throw new Error(`Failed to load blocks: ${blockResult.error.message}`)

  const appointmentEntries: AgendaAppointment[] = appointmentResult.data.map((row) => {
    const { start, end } = parsePeriod(row.period)
    return {
      kind: 'appointment',
      id: row.id,
      dentistId: row.dentist_id,
      start,
      end,
      status: row.status as AppointmentStatus,
      patientName: row.patients.full_name,
      treatmentName: treatmentName(row.treatments.treatment_translations, options.locale),
      paymentMethod: row.payment_method,
      insuranceProvider: row.insurance_provider,
      locale: row.locale,
    }
  })
  const blockEntries: AgendaBlock[] = blockResult.data.map((row) => {
    const { start, end } = parsePeriod(row.period)
    return { kind: 'block', id: row.id, dentistId: row.dentist_id, start, end, reason: row.reason }
  })
  return [...appointmentEntries, ...blockEntries].sort(
    (left, right) => left.start.getTime() - right.start.getTime(),
  )
}

export async function findStaffAppointment(
  db: Db,
  id: string,
  locale: AppLocale,
): Promise<StaffAppointment | undefined> {
  const { data, error } = await db
    .from('appointments')
    .select(
      'id, dentist_id, period, status, payment_method, insurance_provider, patient_notes, source, rescheduled_count, cancellation_reason, created_at, locale, patients!inner(full_name, email, phone), treatments!inner(id, slug, treatment_translations(locale, name)), dentists!inner(id, slug, dentist_translations(locale, display_name))',
    )
    .eq('id', id)
    .in('treatments.treatment_translations.locale', translationLocales(locale))
    .in('dentists.dentist_translations.locale', translationLocales(locale))
    .maybeSingle()
  if (error) throw new Error(`Failed to load appointment: ${error.message}`)
  if (!data) return undefined

  const { start, end } = parsePeriod(data.period)
  const name = treatmentName(data.treatments.treatment_translations, locale)
  return {
    kind: 'appointment',
    id: data.id,
    dentistId: data.dentist_id,
    start,
    end,
    status: data.status as AppointmentStatus,
    patientName: data.patients.full_name,
    treatmentName: name,
    paymentMethod: data.payment_method,
    insuranceProvider: data.insurance_provider,
    locale: data.locale,
    treatment: { id: data.treatments.id, slug: data.treatments.slug, name },
    dentist: {
      id: data.dentists.id,
      slug: data.dentists.slug,
      displayName: dentistName(data.dentists.dentist_translations, locale),
    },
    patient: {
      fullName: data.patients.full_name,
      email: data.patients.email,
      phone: data.patients.phone,
    },
    notes: data.patient_notes,
    source: data.source,
    rescheduledCount: data.rescheduled_count,
    cancellationReason: data.cancellation_reason,
    createdAt: new Date(data.created_at),
  }
}

export type UpcomingBlock = AgendaBlock & { readonly dentistName: string }

export async function listUpcomingBlocks(
  db: Db,
  from: Date,
  locale: AppLocale,
): Promise<UpcomingBlock[]> {
  const { data, error } = await db
    .from('schedule_blocks')
    .select(
      'id, dentist_id, period, reason, dentists!inner(dentist_translations(locale, display_name))',
    )
    .overlaps('period', rangeLiteral(from, new Date(from.getTime() + 1000 * 60 * 60 * 24 * 120)))
    .in('dentists.dentist_translations.locale', translationLocales(locale))
    .order('period')
  if (error) throw new Error(`Failed to load blocks: ${error.message}`)
  return data.map((row) => {
    const { start, end } = parsePeriod(row.period)
    return {
      kind: 'block',
      id: row.id,
      dentistId: row.dentist_id,
      start,
      end,
      reason: row.reason,
      dentistName: dentistName(row.dentists.dentist_translations, locale),
    }
  })
}

export async function countScheduledOverlaps(
  db: Db,
  dentistId: string,
  from: Date,
  to: Date,
): Promise<number> {
  const { count, error } = await db
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('dentist_id', dentistId)
    .eq('status', 'scheduled')
    .overlaps('period', rangeLiteral(from, to))
  if (error) throw new Error(`Failed to check overlaps: ${error.message}`)
  return count ?? 0
}
