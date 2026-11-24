'use server'

import { headers } from 'next/headers'
import { redirect } from '@/i18n/navigation'
import {
  bookAppointment,
  clientFingerprint,
  suggestAlternatives,
  type BookingFailure,
} from '@/modules/booking/booking.service'
import { bookingRequestSchema } from '@/modules/booking/schemas'
import { clinic } from '@/modules/catalog/clinic'

export type BookingActionResult = {
  readonly reason: BookingFailure | 'invalid'
  readonly message: string
  readonly fieldErrors?: Partial<Record<string, string>>
  readonly alternatives?: readonly string[]
}

const MESSAGES: Record<BookingActionResult['reason'], string> = {
  invalid: 'Confira os campos destacados antes de confirmar.',
  slot_unavailable:
    'Esse horário acabou de ser reservado por outra pessoa. Escolha um dos próximos horários livres:',
  treatment_unavailable: 'Esse tratamento não está disponível para agendamento online no momento.',
  dentist_unavailable: 'Esse dentista não atende o tratamento escolhido. Volte e escolha outro.',
  rate_limited: `Muitas tentativas seguidas. Aguarde alguns minutos ou ligue para ${clinic.phone.display}.`,
  unexpected: `Não conseguimos concluir agora. Tente de novo em instantes ou ligue para ${clinic.phone.display}.`,
}

async function clientAddress(): Promise<string> {
  const requestHeaders = await headers()
  return (
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    requestHeaders.get('x-real-ip') ||
    'unknown'
  )
}

export async function submitBooking(input: unknown): Promise<BookingActionResult> {
  const parsed = bookingRequestSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const [scope, field] = issue.path
      if (scope === 'patient' && typeof field === 'string') fieldErrors[field] ??= issue.message
    }
    return { reason: 'invalid', message: MESSAGES.invalid, fieldErrors }
  }

  const result = await bookAppointment(parsed.data, clientFingerprint(await clientAddress()))
  if (result.ok)
    return redirect({ href: `/agendamento/${result.token}?novo=1`, locale: parsed.data.locale })

  return {
    reason: result.reason,
    message: MESSAGES[result.reason],
    alternatives:
      result.reason === 'slot_unavailable' ? await suggestAlternatives(parsed.data) : undefined,
  }
}
