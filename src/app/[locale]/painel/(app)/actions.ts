'use server'

import { after } from 'next/server'
import { redirect } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { formLocale } from '@/i18n/server'
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

function go(locale: AppLocale, href: string): never {
  return redirect({ href, locale })
}

const appointmentPath = (id: string, query: string) => `/painel/consultas/${id}?${query}`

export async function cancelAppointmentAsStaff(formData: FormData): Promise<void> {
  const locale = formLocale(formData)
  const { db, staff } = await requireStaff(locale)
  const parsed = staffCancelSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) go(locale, '/painel?erro=dados')

  const appointment = await findStaffAppointment(db, parsed.data.id, locale)
  if (!appointment || !canManageDentist(staff, appointment.dentistId))
    go(locale, '/painel?erro=acesso')
  if (appointment.status !== 'scheduled') go(locale, appointmentPath(appointment.id, 'erro=status'))

  const { data, error } = await db
    .from('appointments')
    .update({ status: 'cancelled', cancellation_reason: parsed.data.reason })
    .eq('id', appointment.id)
    .eq('status', 'scheduled')
    .select('id')
  if (error || data.length === 0) go(locale, appointmentPath(appointment.id, 'erro=falha'))

  if (parsed.data.notify) after(() => sendAppointmentNotice(appointment.id, 'cancellation'))
  go(locale, appointmentPath(appointment.id, 'ok=cancelada'))
}

export async function rescheduleAppointmentAsStaff(formData: FormData): Promise<void> {
  const locale = formLocale(formData)
  const { db, staff } = await requireStaff(locale)
  const parsed = staffRescheduleSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) go(locale, '/painel?erro=dados')

  const appointment = await findStaffAppointment(db, parsed.data.id, locale)
  if (!appointment || !canManageDentist(staff, appointment.dentistId))
    go(locale, '/painel?erro=acesso')
  if (appointment.status !== 'scheduled') go(locale, appointmentPath(appointment.id, 'erro=status'))

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
  if (!slot) go(locale, appointmentPath(appointment.id, 'erro=horario'))

  const { data, error } = await db
    .from('appointments')
    .update({ period: toPeriodLiteral(slot.start, slot.end) })
    .eq('id', appointment.id)
    .eq('status', 'scheduled')
    .select('id')
  if (error && (isExclusionViolation(error) || raisedReason(error)))
    go(locale, appointmentPath(appointment.id, 'erro=horario'))
  if (error || data.length === 0) go(locale, appointmentPath(appointment.id, 'erro=falha'))

  after(() => sendAppointmentNotice(appointment.id, 'reschedule'))
  go(locale, appointmentPath(appointment.id, 'ok=remarcada'))
}

export async function setAttendance(formData: FormData): Promise<void> {
  const locale = formLocale(formData)
  const { db, staff } = await requireStaff(locale)
  const parsed = attendanceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) go(locale, '/painel?erro=dados')

  const appointment = await findStaffAppointment(db, parsed.data.id, locale)
  if (!appointment || !canManageDentist(staff, appointment.dentistId))
    go(locale, '/painel?erro=acesso')
  if (appointment.status === 'cancelled' || appointment.start.getTime() > Date.now()) {
    go(locale, appointmentPath(appointment.id, 'erro=status'))
  }

  const { error } = await db
    .from('appointments')
    .update({ status: parsed.data.status })
    .eq('id', appointment.id)
  if (error) go(locale, appointmentPath(appointment.id, 'erro=falha'))
  go(locale, appointmentPath(appointment.id, 'ok=presenca'))
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
  const locale = formLocale(formData)
  const { db, staff } = await requireStaff(locale)
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
  const locale = formLocale(formData)
  const { db } = await requireStaff(locale)
  const id = z.uuid().safeParse(formData.get('id'))
  if (!id.success) go(locale, '/painel/bloqueios?erro=dados')

  const { data, error } = await db.from('schedule_blocks').delete().eq('id', id.data).select('id')
  if (error || data.length === 0) go(locale, '/painel/bloqueios?erro=acesso')
  go(locale, '/painel/bloqueios?ok=removido')
}
