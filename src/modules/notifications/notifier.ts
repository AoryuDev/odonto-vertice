import 'server-only'
import { getPathname } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { serverEnv } from '@/lib/env'
import { absoluteUrl } from '@/lib/site'
import { createServiceClient } from '@/lib/supabase/clients'
import {
  findAppointmentById,
  type AppointmentDetails,
} from '@/modules/booking/appointment.repository'
import { manageTokenFor } from '@/modules/booking/manage-token'
import { notificationChannel } from './channel'
import type { AppointmentNotice, NoticeKind } from './types'

export function manageUrlFor(appointmentId: string, locale: AppLocale): string {
  const { token } = manageTokenFor(appointmentId, serverEnv().MANAGE_TOKEN_SECRET)
  return absoluteUrl(getPathname({ href: `/agendamento/${token}`, locale }))
}

export function buildNotice(kind: NoticeKind, appointment: AppointmentDetails): AppointmentNotice {
  const { locale } = appointment
  return {
    kind,
    locale,
    patient: {
      name: appointment.patient.fullName,
      email: appointment.patient.email,
      phone: appointment.patient.phone,
    },
    appointment: {
      treatmentName: appointment.treatment.name,
      dentistName: appointment.dentist.displayName,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      manageUrl:
        kind === 'cancellation'
          ? absoluteUrl(getPathname({ href: '/agendar', locale }))
          : manageUrlFor(appointment.id, locale),
    },
  }
}

export async function sendAppointmentNotice(
  appointmentId: string,
  kind: NoticeKind,
): Promise<void> {
  const appointment = await findAppointmentById(appointmentId)
  if (!appointment) return

  const db = createServiceClient()
  const channel = notificationChannel()
  const { data: claimed, error: claimError } = await db
    .from('notification_deliveries')
    .upsert(
      {
        appointment_id: appointment.id,
        kind,
        channel: channel.name,
        appointment_starts_at: appointment.startsAt.toISOString(),
      },
      { onConflict: 'appointment_id,kind,appointment_starts_at', ignoreDuplicates: true },
    )
    .select('id')
  if (claimError) throw new Error(`Failed to claim notification: ${claimError.message}`)

  const delivery = claimed[0]
  if (!delivery) return

  const receipt = await channel.send(buildNotice(kind, appointment))
  await db
    .from('notification_deliveries')
    .update(
      receipt.ok
        ? { status: 'sent', provider_message_id: receipt.providerMessageId ?? null }
        : { status: 'failed', last_error: receipt.error.slice(0, 500) },
    )
    .eq('id', delivery.id)

  if (!receipt.ok)
    console.error(`Notification ${kind} for ${appointment.id} failed: ${receipt.error}`)
}
