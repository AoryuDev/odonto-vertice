import { renderEmail } from '../templates'
import type { NotificationChannel } from '../types'

export type EmailChannelConfig = {
  readonly apiKey: string
  readonly from: string
  readonly fetcher?: typeof fetch
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export function createEmailChannel(config: EmailChannelConfig): NotificationChannel {
  const fetcher = config.fetcher ?? fetch
  return {
    name: 'email',
    async send(notice) {
      const email = renderEmail(notice)
      try {
        const response = await fetcher(RESEND_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `${notice.kind}-${notice.appointment.manageUrl.split('/').at(-1)}-${notice.appointment.startsAt.getTime()}`,
          },
          body: JSON.stringify({
            from: config.from,
            to: [notice.patient.email],
            subject: email.subject,
            html: email.html,
            text: email.text,
          }),
          signal: AbortSignal.timeout(10_000),
        })
        if (!response.ok) {
          return {
            ok: false,
            error: `Resend responded ${response.status}: ${await response.text()}`,
          }
        }
        const body = (await response.json()) as { id?: string }
        return { ok: true, providerMessageId: body.id }
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) }
      }
    },
  }
}
