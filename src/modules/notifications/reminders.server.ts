import 'server-only'
import { createServiceClient } from '@/lib/supabase/clients'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'
import { notificationChannel } from './channel'
import { manageUrlFor } from './notifier'
import { dispatchReminders, tomorrowWindow, type ReminderRun } from './reminders'

export async function runDailyReminders(now: Date): Promise<ReminderRun> {
  const db = createServiceClient()
  return dispatchReminders(tomorrowWindow(now, CLINIC_TIME_ZONE), {
    channel: notificationChannel(),
    manageUrl: manageUrlFor,
    claim: async (window, channel) => {
      const { data, error } = await db.rpc('claim_reminders', {
        p_from: window.from.toISOString(),
        p_to: window.to.toISOString(),
        p_channel: channel,
      })
      if (error) throw new Error(`claim_reminders failed: ${error.message}`)
      return data.map((row) => ({
        deliveryId: row.delivery_id,
        appointmentId: row.appointment_id,
        startsAt: new Date(row.starts_at),
        endsAt: new Date(row.ends_at),
        patientName: row.patient_name,
        patientEmail: row.patient_email,
        patientPhone: row.patient_phone,
        dentistName: row.dentist_name,
        treatmentName: row.treatment_name,
      }))
    },
    record: async (deliveryId, receipt) => {
      const { error } = await db
        .from('notification_deliveries')
        .update(
          receipt.ok
            ? {
                status: 'sent',
                provider_message_id: receipt.providerMessageId ?? null,
                last_error: null,
              }
            : { status: 'failed', last_error: receipt.error.slice(0, 500) },
        )
        .eq('id', deliveryId)
      if (error) console.error(`Failed to record delivery ${deliveryId}: ${error.message}`)
    },
  })
}
