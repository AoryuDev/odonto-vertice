import 'server-only'
import { after } from 'next/server'
import { createServiceClient } from '@/lib/supabase/clients'
import { isExclusionViolation, raisedReason } from '@/lib/supabase/errors'
import { listDentists, listTreatments } from '@/modules/catalog/catalog.repository'
import { sendAppointmentNotice } from '@/modules/notifications/notifier'
import { loadAvailabilityContext } from '@/modules/schedule/availability.service'
import { findSlot, type AvailabilityContext } from '@/modules/schedule/domain/availability'
import { addMinutes, toLocalDate } from '@/modules/schedule/domain/clinic-time'
import { clinicPolicy } from '@/modules/schedule/domain/policy'
import {
  findAppointmentByToken,
  toPeriodLiteral,
  type AppointmentDetails,
} from './appointment.repository'

export type ManageFailure =
  'not_found' | 'not_scheduled' | 'too_late' | 'slot_unavailable' | 'unexpected'

export type ManageResult =
  { readonly ok: true } | { readonly ok: false; readonly reason: ManageFailure }

export function canManageOnline(appointment: AppointmentDetails, now: Date): boolean {
  return (
    appointment.status === 'scheduled' &&
    appointment.startsAt.getTime() >= addMinutes(now, clinicPolicy.minimumNoticeMinutes).getTime()
  )
}

export function withoutOwnPeriod(
  context: AvailabilityContext,
  appointment: AppointmentDetails,
): AvailabilityContext {
  return {
    ...context,
    busy: context.busy.filter(
      (period) =>
        !(
          period.dentistId === appointment.dentist.id &&
          period.start.getTime() === appointment.startsAt.getTime() &&
          period.end.getTime() === appointment.endsAt.getTime()
        ),
    ),
  }
}

async function loadManageable(
  token: string,
): Promise<{ ok: true; appointment: AppointmentDetails } | { ok: false; reason: ManageFailure }> {
  const appointment = await findAppointmentByToken(token)
  if (!appointment) return { ok: false, reason: 'not_found' }
  if (appointment.status !== 'scheduled') return { ok: false, reason: 'not_scheduled' }
  if (!canManageOnline(appointment, new Date())) return { ok: false, reason: 'too_late' }
  return { ok: true, appointment }
}

export async function rescheduleContext(
  appointment: AppointmentDetails,
): Promise<AvailabilityContext | undefined> {
  const [treatments, dentists] = await Promise.all([listTreatments(), listDentists()])
  const treatment = treatments.find((candidate) => candidate.id === appointment.treatment.id)
  const dentist = dentists.find((candidate) => candidate.id === appointment.dentist.id)
  if (!treatment || !dentist) return undefined
  return withoutOwnPeriod(await loadAvailabilityContext(treatment, [dentist]), appointment)
}

export async function cancelByToken(token: string, reason?: string): Promise<ManageResult> {
  const loaded = await loadManageable(token)
  if (!loaded.ok) return loaded

  const { data, error } = await createServiceClient()
    .from('appointments')
    .update({ status: 'cancelled', cancellation_reason: reason ?? 'Cancelada pelo paciente' })
    .eq('id', loaded.appointment.id)
    .eq('status', 'scheduled')
    .select('id')
  if (error) {
    console.error(`Cancel failed: ${error.message}`)
    return { ok: false, reason: 'unexpected' }
  }
  if (data.length === 0) return { ok: false, reason: 'not_scheduled' }

  after(() => sendAppointmentNotice(loaded.appointment.id, 'cancellation'))
  return { ok: true }
}

export async function rescheduleByToken(token: string, startsAt: Date): Promise<ManageResult> {
  const loaded = await loadManageable(token)
  if (!loaded.ok) return loaded
  const { appointment } = loaded

  const context = await rescheduleContext(appointment)
  if (!context) return { ok: false, reason: 'unexpected' }

  const slot = findSlot(toLocalDate(startsAt, clinicPolicy.timeZone), startsAt, context)
  if (!slot) return { ok: false, reason: 'slot_unavailable' }

  const { data, error } = await createServiceClient()
    .from('appointments')
    .update({ period: toPeriodLiteral(slot.start, slot.end) })
    .eq('id', appointment.id)
    .eq('status', 'scheduled')
    .select('id')

  if (error) {
    if (isExclusionViolation(error) || raisedReason(error)) {
      return { ok: false, reason: 'slot_unavailable' }
    }
    console.error(`Reschedule failed: ${error.message}`)
    return { ok: false, reason: 'unexpected' }
  }
  if (data.length === 0) return { ok: false, reason: 'not_scheduled' }

  after(() => sendAppointmentNotice(appointment.id, 'reschedule'))
  return { ok: true }
}
