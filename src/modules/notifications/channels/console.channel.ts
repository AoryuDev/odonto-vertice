import { renderShortText } from '../templates'
import type { NotificationChannel } from '../types'

export const consoleChannel: NotificationChannel = {
  name: 'console',
  async send(notice) {
    console.info(
      `[notification:${notice.kind}] → ${notice.patient.email}\n${renderShortText(notice)}`,
    )
    return { ok: true }
  },
}
