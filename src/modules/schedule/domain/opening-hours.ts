import type { WeeklySchedule } from './availability'
import type { LocalTime } from './clinic-time'

export type OpeningHours = {
  readonly weekday: number
  readonly opensAt: LocalTime
  readonly closesAt: LocalTime
}

export const SCHEMA_ORG_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export function clinicOpeningHours(schedules: readonly WeeklySchedule[]): OpeningHours[] {
  const byWeekday = new Map<number, OpeningHours>()
  for (const schedule of schedules) {
    const current = byWeekday.get(schedule.weekday)
    byWeekday.set(schedule.weekday, {
      weekday: schedule.weekday,
      opensAt: current && current.opensAt < schedule.startsAt ? current.opensAt : schedule.startsAt,
      closesAt: current && current.closesAt > schedule.endsAt ? current.closesAt : schedule.endsAt,
    })
  }
  return [...byWeekday.values()].sort(
    (left, right) => ((left.weekday + 6) % 7) - ((right.weekday + 6) % 7),
  )
}

export type OpeningHoursGroup = {
  readonly weekdays: readonly number[]
  readonly opensAt: LocalTime
  readonly closesAt: LocalTime
}

export function groupOpeningHours(hours: readonly OpeningHours[]): OpeningHoursGroup[] {
  const groups: { weekdays: number[]; opensAt: LocalTime; closesAt: LocalTime }[] = []
  for (const entry of hours) {
    const last = groups.at(-1)
    const previousWeekday = last?.weekdays.at(-1)
    if (
      last &&
      previousWeekday !== undefined &&
      (previousWeekday + 1) % 7 === entry.weekday &&
      last.opensAt === entry.opensAt &&
      last.closesAt === entry.closesAt
    ) {
      last.weekdays.push(entry.weekday)
    } else {
      groups.push({ weekdays: [entry.weekday], opensAt: entry.opensAt, closesAt: entry.closesAt })
    }
  }
  return groups
}

export type HoursSummary = {
  readonly weekdays: readonly number[]
  readonly opensAt: LocalTime
  readonly closesAt: LocalTime
}

export function summarizeWeekHours(hours: readonly OpeningHours[]): HoursSummary[] {
  const weekdays = hours.filter((entry) => entry.weekday >= 1 && entry.weekday <= 5)
  const summaries: HoursSummary[] = []
  if (weekdays.length > 0) {
    const opensAt = weekdays.reduce(
      (min, entry) => (entry.opensAt < min ? entry.opensAt : min),
      weekdays[0]!.opensAt,
    )
    const closesAt = weekdays.reduce(
      (max, entry) => (entry.closesAt > max ? entry.closesAt : max),
      weekdays[0]!.closesAt,
    )
    summaries.push({
      weekdays: weekdays.map((entry) => entry.weekday),
      opensAt,
      closesAt,
    })
  }
  for (const weekend of hours.filter((entry) => entry.weekday === 6 || entry.weekday === 0)) {
    summaries.push({
      weekdays: [weekend.weekday],
      opensAt: weekend.opensAt,
      closesAt: weekend.closesAt,
    })
  }
  return summaries
}
