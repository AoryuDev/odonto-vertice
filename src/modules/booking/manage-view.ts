import 'server-only'
import { connection } from 'next/server'
import type { AppLocale } from '@/i18n/routing'
import { manageTokenSchema } from './schemas'
import { findAppointmentByToken, type AppointmentDetails } from './appointment.repository'
import { canManageOnline, type ManageFailure } from './manage.service'

export type ManageView = {
  readonly appointment: AppointmentDetails
  readonly canManage: boolean
  readonly isPast: boolean
}

export async function loadManageView(
  token: string,
  displayLocale: AppLocale,
): Promise<ManageView | undefined> {
  await connection()
  if (!manageTokenSchema.safeParse(token).success) return undefined
  const appointment = await findAppointmentByToken(token, displayLocale)
  if (!appointment) return undefined
  const now = new Date()
  return {
    appointment,
    canManage: canManageOnline(appointment, now),
    isPast: appointment.endsAt.getTime() < now.getTime(),
  }
}

const MANAGE_FAILURES = [
  'not_found',
  'not_scheduled',
  'too_late',
  'slot_unavailable',
  'unexpected',
] as const satisfies readonly ManageFailure[]

export function manageFailureFrom(value: unknown): ManageFailure | undefined {
  return MANAGE_FAILURES.find((failure) => failure === value)
}
