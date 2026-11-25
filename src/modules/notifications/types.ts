import type { AppLocale } from '@/i18n/routing'

export type NoticeKind = 'confirmation' | 'reminder' | 'cancellation' | 'reschedule'

export type AppointmentNotice = {
  readonly kind: NoticeKind
  readonly locale: AppLocale
  readonly patient: { readonly name: string; readonly email: string; readonly phone: string }
  readonly appointment: {
    readonly treatmentName: string
    readonly dentistName: string
    readonly startsAt: Date
    readonly endsAt: Date
    readonly manageUrl: string
  }
}

export type DeliveryReceipt =
  | { readonly ok: true; readonly providerMessageId?: string }
  | { readonly ok: false; readonly error: string }

export type ChannelName = 'console' | 'email' | 'whatsapp'

export interface NotificationChannel {
  readonly name: ChannelName
  send(notice: AppointmentNotice): Promise<DeliveryReceipt>
}
