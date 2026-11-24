import 'server-only'
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

export async function listAgenda(
  db: Db,
  options: { from: Date; to: Date; dentistIds?: readonly string[] },
): Promise<AgendaEntry[]> {
  const range = rangeLiteral(options.from, options.to)
  let appointments = db
    .from('appointments')
    .select(
      'id, dentist_id, period, status, payment_method, insurance_provider, patients!inner(full_name), treatments!inner(name)',
    )
    .overlaps('period', range)
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
      treatmentName: row.treatments.name,
      paymentMethod: row.payment_method,
      insuranceProvider: row.insurance_provider,
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
): Promise<StaffAppointment | undefined> {
  const { data, error } = await db
    .from('appointments')
    .select(
      'id, dentist_id, period, status, payment_method, insurance_provider, patient_notes, source, rescheduled_count, cancellation_reason, created_at, patients!inner(full_name, email, phone), treatments!inner(id, slug, name), dentists!inner(id, slug, display_name)',
    )
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`Failed to load appointment: ${error.message}`)
  if (!data) return undefined

  const { start, end } = parsePeriod(data.period)
  return {
    kind: 'appointment',
    id: data.id,
    dentistId: data.dentist_id,
    start,
    end,
    status: data.status as AppointmentStatus,
    patientName: data.patients.full_name,
    treatmentName: data.treatments.name,
    paymentMethod: data.payment_method,
    insuranceProvider: data.insurance_provider,
    treatment: data.treatments,
    dentist: {
      id: data.dentists.id,
      slug: data.dentists.slug,
      displayName: data.dentists.display_name,
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

export async function listUpcomingBlocks(db: Db, from: Date): Promise<UpcomingBlock[]> {
  const { data, error } = await db
    .from('schedule_blocks')
    .select('id, dentist_id, period, reason, dentists!inner(display_name)')
    .overlaps('period', rangeLiteral(from, new Date(from.getTime() + 1000 * 60 * 60 * 24 * 120)))
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
      dentistName: row.dentists.display_name,
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
