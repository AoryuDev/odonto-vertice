'use server'

import { redirect } from '@/i18n/navigation'
import { formLocale } from '@/i18n/server'
import { cancelByToken, rescheduleByToken } from '@/modules/booking/manage.service'
import { cancelRequestSchema, rescheduleRequestSchema } from '@/modules/booking/schemas'

export async function cancelAppointment(formData: FormData): Promise<void> {
  const locale = formLocale(formData)
  const parsed = cancelRequestSchema.safeParse({
    token: formData.get('token'),
    reason: formData.get('reason') || undefined,
  })
  if (!parsed.success) return redirect({ href: '/agendar', locale })

  const result = await cancelByToken(parsed.data.token, parsed.data.reason)
  redirect({
    href: `/agendamento/${parsed.data.token}?${result.ok ? 'cancelada=1' : `erro=${result.reason}`}`,
    locale,
  })
}

export async function rescheduleAppointment(formData: FormData): Promise<void> {
  const locale = formLocale(formData)
  const parsed = rescheduleRequestSchema.safeParse({
    token: formData.get('token'),
    startsAt: formData.get('startsAt'),
  })
  if (!parsed.success) return redirect({ href: '/agendar', locale })

  const result = await rescheduleByToken(parsed.data.token, parsed.data.startsAt)
  if (result.ok) return redirect({ href: `/agendamento/${parsed.data.token}?remarcada=1`, locale })
  redirect({ href: `/agendamento/${parsed.data.token}/remarcar?erro=${result.reason}`, locale })
}
