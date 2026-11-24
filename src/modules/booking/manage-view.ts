import 'server-only'
import { connection } from 'next/server'
import { manageTokenSchema } from './schemas'
import { findAppointmentByToken, type AppointmentDetails } from './appointment.repository'
import { canManageOnline } from './manage.service'

export type ManageView = {
  readonly appointment: AppointmentDetails
  readonly canManage: boolean
  readonly isPast: boolean
}

export async function loadManageView(token: string): Promise<ManageView | undefined> {
  await connection()
  if (!manageTokenSchema.safeParse(token).success) return undefined
  const appointment = await findAppointmentByToken(token)
  if (!appointment) return undefined
  const now = new Date()
  return {
    appointment,
    canManage: canManageOnline(appointment, now),
    isPast: appointment.endsAt.getTime() < now.getTime(),
  }
}

export const MANAGE_ERRORS: Record<string, string> = {
  not_found: 'Não encontramos esse agendamento.',
  not_scheduled: 'Essa consulta já foi cancelada ou realizada.',
  too_late: 'Faltam menos de duas horas para a consulta. Para mudar, ligue para a recepção.',
  slot_unavailable: 'Esse horário acabou de ser ocupado. Escolha outro.',
  unexpected: 'Não conseguimos concluir agora. Tente de novo em instantes.',
}
