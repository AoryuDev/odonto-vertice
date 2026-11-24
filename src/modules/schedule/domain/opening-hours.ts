import type { WeeklySchedule } from './availability'
import type { LocalTime } from './clinic-time'

export type OpeningHours = {
  readonly weekday: number
  readonly opensAt: LocalTime
  readonly closesAt: LocalTime
}

export const WEEKDAY_LABELS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const

export const WEEKDAY_SHORT_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

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

export function describeWeekdays(weekdays: readonly number[]): string {
  const first = weekdays[0]
  const last = weekdays.at(-1)
  if (first === undefined || last === undefined) return ''
  if (weekdays.length === 1) return WEEKDAY_LABELS[first] ?? ''
  if (weekdays.length === 2) return `${WEEKDAY_SHORT_LABELS[first]} e ${WEEKDAY_SHORT_LABELS[last]}`
  return `${WEEKDAY_SHORT_LABELS[first]} a ${WEEKDAY_SHORT_LABELS[last]}`
}
