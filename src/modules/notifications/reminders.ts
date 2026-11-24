import {
  addDays,
  parseLocalTime,
  toInstant,
  toLocalDate,
} from '@/modules/schedule/domain/clinic-time'
import type { AppointmentNotice, DeliveryReceipt, NotificationChannel } from './types'

export type ReminderWindow = { readonly from: Date; readonly to: Date }

export function tomorrowWindow(now: Date, timeZone: string): ReminderWindow {
  const tomorrow = addDays(toLocalDate(now, timeZone), 1)
  const midnight = parseLocalTime('00:00')
  return {
    from: toInstant(tomorrow, midnight, timeZone),
    to: toInstant(addDays(tomorrow, 1), midnight, timeZone),
  }
}

export type ClaimedReminder = {
  readonly deliveryId: string
  readonly appointmentId: string
  readonly startsAt: Date
  readonly endsAt: Date
  readonly patientName: string
  readonly patientEmail: string
  readonly patientPhone: string
  readonly dentistName: string
  readonly treatmentName: string
}

export type ReminderDependencies = {
  readonly channel: NotificationChannel
  readonly claim: (window: ReminderWindow, channel: string) => Promise<readonly ClaimedReminder[]>
  readonly record: (deliveryId: string, receipt: DeliveryReceipt) => Promise<void>
  readonly manageUrl: (appointmentId: string) => string
  readonly concurrency?: number
}

export type ReminderRun = {
  readonly window: ReminderWindow
  readonly claimed: number
  readonly sent: number
  readonly failed: number
}

export function reminderNotice(reminder: ClaimedReminder, manageUrl: string): AppointmentNotice {
  return {
    kind: 'reminder',
    patient: {
      name: reminder.patientName,
      email: reminder.patientEmail,
      phone: reminder.patientPhone,
    },
    appointment: {
      treatmentName: reminder.treatmentName,
      dentistName: reminder.dentistName,
      startsAt: reminder.startsAt,
      endsAt: reminder.endsAt,
      manageUrl,
    },
  }
}

export async function dispatchReminders(
  window: ReminderWindow,
  deps: ReminderDependencies,
): Promise<ReminderRun> {
  const claimed = await deps.claim(window, deps.channel.name)
  const concurrency = Math.max(1, deps.concurrency ?? 5)
  let sent = 0
  let failed = 0

  for (let index = 0; index < claimed.length; index += concurrency) {
    const batch = claimed.slice(index, index + concurrency)
    const receipts = await Promise.all(
      batch.map(async (reminder) => {
        const receipt = await deps.channel
          .send(reminderNotice(reminder, deps.manageUrl(reminder.appointmentId)))
          .catch((error: unknown): DeliveryReceipt => ({
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          }))
        await deps.record(reminder.deliveryId, receipt)
        return receipt
      }),
    )
    sent += receipts.filter((receipt) => receipt.ok).length
    failed += receipts.filter((receipt) => !receipt.ok).length
  }

  return { window, claimed: claimed.length, sent, failed }
}
