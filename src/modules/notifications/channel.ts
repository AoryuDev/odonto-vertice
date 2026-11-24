import 'server-only'
import { serverEnv } from '@/lib/env'
import { consoleChannel } from './channels/console.channel'
import { createEmailChannel } from './channels/email.channel'
import { createWhatsAppChannel } from './channels/whatsapp.channel'
import type { NotificationChannel } from './types'

export function notificationChannel(): NotificationChannel {
  const env = serverEnv()
  switch (env.NOTIFICATION_CHANNEL) {
    case 'email':
      return createEmailChannel({ apiKey: env.RESEND_API_KEY ?? '', from: env.EMAIL_FROM ?? '' })
    case 'whatsapp':
      return createWhatsAppChannel({
        accessToken: env.WHATSAPP_ACCESS_TOKEN ?? '',
        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID ?? '',
        templates: {
          confirmation: 'consulta_confirmada',
          reminder: 'consulta_lembrete',
          reschedule: 'consulta_remarcada',
          cancellation: 'consulta_cancelada',
        },
      })
    case 'console':
      return consoleChannel
  }
}
