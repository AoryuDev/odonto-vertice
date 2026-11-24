'use server'

import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { isExclusionViolation, raisedReason } from '@/lib/supabase/errors'
import { toPeriodLiteral } from '@/modules/booking/appointment.repository'
import { rescheduleContext } from '@/modules/booking/manage.service'
import { countScheduledOverlaps, findStaffAppointment } from '@/modules/admin/agenda.repository'
import {
  attendanceSchema,
  blockFormSchema,
  staffCancelSchema,
  staffRescheduleSchema,
} from '@/modules/admin/schemas'
import { canManageDentist, requireStaff } from '@/modules/admin/session'
import { sendAppointmentNotice } from '@/modules/notifications/notifier'
import { staffPolicy } from '@/modules/schedule/availability.service'
import { findSlot } from '@/modules/schedule/domain/availability'
import { toLocalDate } from '@/modules/schedule/domain/clinic-time'
import { z } from 'zod'

const appointmentPath = (id: string, query: string) => `/painel/consultas/${id}?${query}`

export async function cancelAppointmentAsStaff(formData: FormData): Promise<void> {
  const { db, staff } = await requireStaff()
  const parsed = staffCancelSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/painel?erro=dados')

  const appointment = await findStaffAppointment(db, parsed.data.id)
  if (!appointment || !canManageDentist(staff, appointment.dentistId))
    redirect('/painel?erro=acesso')
  if (appointment.status !== 'scheduled') redirect(appointmentPath(appointment.id, 'erro=status'))

  const { data, error } = await db
    .from('appointments')
    .update({ status: 'cancelled', cancellation_reason: parsed.data.reason })
    .eq('id', appointment.id)
    .eq('status', 'scheduled')
    .select('id')
  if (error || data.length === 0) redirect(appointmentPath(appointment.id, 'erro=falha'))

  if (parsed.data.notify) after(() => sendAppointmentNotice(appointment.id, 'cancellation'))
  redirect(appointmentPath(appointment.id, 'ok=cancelada'))
}

export async function rescheduleAppointmentAsStaff(formData: FormData): Promise<void> {
  const { db, staff } = await requireStaff()
  const parsed = staffRescheduleSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/painel?erro=dados')

  const appointment = await findStaffAppointment(db, parsed.data.id)
  if (!appointment || !canManageDentist(staff, appointment.dentistId))
    redirect('/painel?erro=acesso')
  if (appointment.status !== 'scheduled') redirect(appointmentPath(appointment.id, 'erro=status'))

  const context = await rescheduleContext(
    {
      treatment: appointment.treatment,
      dentist: appointment.dentist,
      startsAt: appointment.start,
      endsAt: appointment.end,
    },
    staffPolicy,
  )
  const slot =
    context &&
    findSlot(toLocalDate(parsed.data.startsAt, staffPolicy.timeZone), parsed.data.startsAt, context)
  if (!slot) redirect(appointmentPath(appointment.id, 'erro=horario'))

  const { data, error } = await db
    .from('appointments')
    .update({ period: toPeriodLiteral(slot.start, slot.end) })
    .eq('id', appointment.id)
    .eq('status', 'scheduled')
    .select('id')
  if (error && (isExclusionViolation(error) || raisedReason(error)))
    redirect(appointmentPath(appointment.id, 'erro=horario'))
  if (error || data.length === 0) redirect(appointmentPath(appointment.id, 'erro=falha'))

  after(() => sendAppointmentNotice(appointment.id, 'reschedule'))
  redirect(appointmentPath(appointment.id, 'ok=remarcada'))
}

export async function setAttendance(formData: FormData): Promise<void> {
  const { db, staff } = await requireStaff()
  const parsed = attendanceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/painel?erro=dados')

  const appointment = await findStaffAppointment(db, parsed.data.id)
  if (!appointment || !canManageDentist(staff, appointment.dentistId))
    redirect('/painel?erro=acesso')
  if (appointment.status === 'cancelled' || appointment.start.getTime() > Date.now()) {
    redirect(appointmentPath(appointment.id, 'erro=status'))
  }

  const { error } = await db
    .from('appointments')
    .update({ status: parsed.data.status })
    .eq('id', appointment.id)
  if (error) redirect(appointmentPath(appointment.id, 'erro=falha'))
  redirect(appointmentPath(appointment.id, 'ok=presenca'))
}

export type BlockFormState = {
  readonly error?: string
  readonly fieldErrors?: Partial<Record<string, string>>
  readonly ok?: boolean
}

export async function createBlock(
  _state: BlockFormState,
  formData: FormData,
): Promise<BlockFormState> {
  const { db, staff } = await requireStaff()
  const raw = Object.fromEntries(formData)
  const parsed = blockFormSchema.safeParse({
    ...raw,
    dentistId: staff.role === 'dentist' ? staff.dentistId : raw.dentistId,
  })
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      fieldErrors[key] ??= issue.message
    }
    return { error: 'Confira os campos destacados.', fieldErrors }
  }
  if (!canManageDentist(staff, parsed.data.dentistId))
    return { error: 'Você não pode bloquear a agenda de outro dentista.' }
  if (parsed.data.end.getTime() <= Date.now())
    return { error: 'O bloqueio precisa terminar no futuro.' }

  const overlapping = await countScheduledOverlaps(
    db,
    parsed.data.dentistId,
    parsed.data.start,
    parsed.data.end,
  )
  if (overlapping > 0) {
    return {
      error: `Há ${overlapping} ${overlapping === 1 ? 'consulta marcada' : 'consultas marcadas'} nesse intervalo. Remarque ou cancele antes de bloquear.`,
    }
  }

  const { error } = await db.from('schedule_blocks').insert({
    dentist_id: parsed.data.dentistId,
    period: toPeriodLiteral(parsed.data.start, parsed.data.end),
    reason: parsed.data.reason,
  })
  if (error) {
    console.error(`Block insert failed: ${error.message}`)
    return { error: 'Não foi possível salvar o bloqueio.' }
  }
  return { ok: true }
}

export async function deleteBlock(formData: FormData): Promise<void> {
  const { db } = await requireStaff()
  const id = z.uuid().safeParse(formData.get('id'))
  if (!id.success) redirect('/painel/bloqueios?erro=dados')

  const { data, error } = await db.from('schedule_blocks').delete().eq('id', id.data).select('id')
  if (error || data.length === 0) redirect('/painel/bloqueios?erro=acesso')
  redirect('/painel/bloqueios?ok=removido')
}
