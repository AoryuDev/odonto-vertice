export type AvailabilityPolicy = {
  readonly timeZone: string
  readonly slotStepMinutes: number
  readonly minimumNoticeMinutes: number
  readonly bookingHorizonDays: number
}

export const CLINIC_TIME_ZONE = 'America/Sao_Paulo'

export const clinicPolicy = {
  timeZone: CLINIC_TIME_ZONE,
  slotStepMinutes: 15,
  minimumNoticeMinutes: 120,
  bookingHorizonDays: 45,
} as const satisfies AvailabilityPolicy
