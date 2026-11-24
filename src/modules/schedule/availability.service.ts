import 'server-only'
import { connection } from 'next/server'
import type { Dentist, Treatment } from '@/modules/catalog/types'
import { bookableDateRange, type AvailabilityContext } from './domain/availability'
import { addDays, parseLocalTime, toInstant } from './domain/clinic-time'
import { clinicPolicy } from './domain/policy'
import { listBusyPeriods, listHolidays } from './schedule.repository'

const MIDNIGHT = parseLocalTime('00:00')

export async function loadAvailabilityContext(
  treatment: Treatment,
  candidates: readonly Dentist[],
): Promise<AvailabilityContext> {
  await connection()
  const now = new Date()
  const { first, last } = bookableDateRange(now, clinicPolicy)
  const from = toInstant(first, MIDNIGHT, clinicPolicy.timeZone)
  const to = toInstant(addDays(last, 1), MIDNIGHT, clinicPolicy.timeZone)
  const dentistIds = candidates.map((dentist) => dentist.id)

  const [busy, holidays] = await Promise.all([
    listBusyPeriods(dentistIds, from, to),
    listHolidays(),
  ])

  return {
    durationMinutes: treatment.durationMinutes,
    dentistIds,
    schedules: candidates.flatMap((dentist) => dentist.schedules),
    holidays: new Set(holidays.map((holiday) => holiday.date)),
    busy,
    now,
    policy: clinicPolicy,
  }
}
