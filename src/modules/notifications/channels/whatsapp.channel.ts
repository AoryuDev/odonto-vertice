import type { AppLocale } from '@/i18n/routing'
import { describeWhenForWhatsApp } from '../templates'
import type { AppointmentNotice, NoticeKind, NotificationChannel } from '../types'

const TEMPLATE_LANGUAGES: Record<AppLocale, string> = { pt: 'pt_BR', en: 'en_US' }

export type WhatsAppChannelConfig = {
  readonly accessToken: string
  readonly phoneNumberId: string
  readonly templates: Readonly<Record<NoticeKind, string>>
  readonly apiVersion?: string
  readonly fetcher?: typeof fetch
}

export function whatsappTemplatePayload(notice: AppointmentNotice, config: WhatsAppChannelConfig) {
  const firstName = notice.patient.name.trim().split(/\s+/)[0] ?? notice.patient.name
  const parameters = [
    firstName,
    notice.appointment.treatmentName,
    notice.appointment.dentistName,
    describeWhenForWhatsApp(notice),
    notice.appointment.manageUrl,
  ]
  return {
    messaging_product: 'whatsapp',
    to: notice.patient.phone.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: config.templates[notice.kind],
      language: { code: TEMPLATE_LANGUAGES[notice.locale] },
      components: [
        { type: 'body', parameters: parameters.map((text) => ({ type: 'text', text })) },
      ],
    },
  }
}

export function createWhatsAppChannel(config: WhatsAppChannelConfig): NotificationChannel {
  const fetcher = config.fetcher ?? fetch
  const endpoint = `https://graph.facebook.com/${config.apiVersion ?? 'v21.0'}/${config.phoneNumberId}/messages`
  return {
    name: 'whatsapp',
    async send(notice) {
      try {
        const response = await fetcher(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(whatsappTemplatePayload(notice, config)),
          signal: AbortSignal.timeout(10_000),
        })
        if (!response.ok)
          return {
            ok: false,
            error: `WhatsApp responded ${response.status}: ${await response.text()}`,
          }
        const body = (await response.json()) as { messages?: { id?: string }[] }
        return { ok: true, providerMessageId: body.messages?.[0]?.id }
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) }
      }
    },
  }
}
