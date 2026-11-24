'use server'

import { redirect } from 'next/navigation'
import { cancelByToken, rescheduleByToken } from '@/modules/booking/manage.service'
import { cancelRequestSchema, rescheduleRequestSchema } from '@/modules/booking/schemas'

export async function cancelAppointment(formData: FormData): Promise<void> {
  const parsed = cancelRequestSchema.safeParse({
    token: formData.get('token'),
    reason: formData.get('reason') || undefined,
  })
  if (!parsed.success) redirect('/agendar')

  const result = await cancelByToken(parsed.data.token, parsed.data.reason)
  redirect(
    `/agendamento/${parsed.data.token}?${result.ok ? 'cancelada=1' : `erro=${result.reason}`}`,
  )
}

export async function rescheduleAppointment(formData: FormData): Promise<void> {
  const parsed = rescheduleRequestSchema.safeParse({
    token: formData.get('token'),
    startsAt: formData.get('startsAt'),
  })
  if (!parsed.success) redirect('/agendar')

  const result = await rescheduleByToken(parsed.data.token, parsed.data.startsAt)
  if (result.ok) redirect(`/agendamento/${parsed.data.token}?remarcada=1`)
  redirect(`/agendamento/${parsed.data.token}/remarcar?erro=${result.reason}`)
}
