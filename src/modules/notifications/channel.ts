import 'server-only'
import { serverEnv } from '@/lib/env'
import { consoleChannel } from './channels/console.channel'
import { createEmailChannel } from './channels/email.channel'
import type { NotificationChannel } from './types'

export function notificationChannel(): NotificationChannel {
  const env = serverEnv()
  switch (env.NOTIFICATION_CHANNEL) {
    case 'email':
      return createEmailChannel({ apiKey: env.RESEND_API_KEY ?? '', from: env.EMAIL_FROM ?? '' })
    case 'console':
      return consoleChannel
  }
}
