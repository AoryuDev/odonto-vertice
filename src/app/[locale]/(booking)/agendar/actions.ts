'use server'

import { getTranslations } from 'next-intl/server'
import { headers } from 'next/headers'
import { redirect } from '@/i18n/navigation'
import { localeFrom } from '@/i18n/server'
import {
  bookAppointment,
  clientFingerprint,
  suggestAlternatives,
  type BookingFailure,
} from '@/modules/booking/booking.service'
import { bookingRequestSchema } from '@/modules/booking/schemas'

export type BookingActionResult = {
  readonly reason: BookingFailure | 'invalid'
  readonly message: string
  readonly fieldErrors?: Partial<Record<string, string>>
  readonly alternatives?: readonly string[]
}

async function clientAddress(): Promise<string> {
  const requestHeaders = await headers()
  return (
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    requestHeaders.get('x-real-ip') ||
    'unknown'
  )
}

function requestedLocale(input: unknown) {
  return localeFrom(
    typeof input === 'object' && input !== null && 'locale' in input ? input.locale : undefined,
  )
}

export async function submitBooking(input: unknown): Promise<BookingActionResult> {
  const parsed = bookingRequestSchema.safeParse(input)
  const locale = parsed.success ? parsed.data.locale : requestedLocale(input)
  const t = await getTranslations({ locale, namespace: 'booking.errors' })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const [scope, field] = issue.path
      if (scope === 'patient' && typeof field === 'string') fieldErrors[field] ??= issue.message
    }
    return { reason: 'invalid', message: t('invalid'), fieldErrors }
  }

  const result = await bookAppointment(parsed.data, clientFingerprint(await clientAddress()))
  if (result.ok) return redirect({ href: `/agendamento/${result.token}?novo=1`, locale })

  return {
    reason: result.reason,
    message: t(result.reason),
    alternatives:
      result.reason === 'slot_unavailable' ? await suggestAlternatives(parsed.data) : undefined,
  }
}
