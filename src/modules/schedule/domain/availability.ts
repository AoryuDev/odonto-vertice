import {
  addDays,
  addMinutes,
  compareLocalDates,
  toInstant,
  toLocalDate,
  weekdayOf,
  type LocalDate,
  type LocalTime,
} from './clinic-time'
import type { AvailabilityPolicy } from './policy'

export type WeeklySchedule = {
  readonly dentistId: string
  readonly weekday: number
  readonly startsAt: LocalTime
  readonly endsAt: LocalTime
  readonly lunch: { readonly startsAt: LocalTime; readonly endsAt: LocalTime } | null
}

export type BusyPeriod = {
  readonly dentistId: string
  readonly start: Date
  readonly end: Date
}

export type Slot = {
  readonly start: Date
  readonly end: Date
  readonly dentistIds: readonly string[]
}

export type AvailabilityContext = {
  readonly durationMinutes: number
  readonly dentistIds: readonly string[]
  readonly schedules: readonly WeeklySchedule[]
  readonly holidays: ReadonlySet<string>
  readonly busy: readonly BusyPeriod[]
  readonly now: Date
  readonly policy: AvailabilityPolicy
}

type Interval = { readonly start: Date; readonly end: Date }

export function overlaps(left: Interval, right: Interval): boolean {
  return left.start.getTime() < right.end.getTime() && right.start.getTime() < left.end.getTime()
}

export function bookableDateRange(
  now: Date,
  policy: AvailabilityPolicy,
): { first: LocalDate; last: LocalDate } {
  const first = toLocalDate(now, policy.timeZone)
  return { first, last: addDays(first, policy.bookingHorizonDays) }
}

export function isWithinHorizon(date: LocalDate, now: Date, policy: AvailabilityPolicy): boolean {
  const { first, last } = bookableDateRange(now, policy)
  return compareLocalDates(date, first) >= 0 && compareLocalDates(date, last) <= 0
}

function workingWindows(schedule: WeeklySchedule, date: LocalDate, timeZone: string): Interval[] {
  const at = (time: LocalTime) => toInstant(date, time, timeZone)
  if (!schedule.lunch) {
    return [{ start: at(schedule.startsAt), end: at(schedule.endsAt) }]
  }
  return [
    { start: at(schedule.startsAt), end: at(schedule.lunch.startsAt) },
    { start: at(schedule.lunch.endsAt), end: at(schedule.endsAt) },
  ]
}

function dentistSlotStarts(
  dentistId: string,
  date: LocalDate,
  context: AvailabilityContext,
): Date[] {
  const { policy, durationMinutes, now } = context
  const schedule = context.schedules.find(
    (candidate) => candidate.dentistId === dentistId && candidate.weekday === weekdayOf(date),
  )
  if (!schedule) return []

  const earliestStart = addMinutes(now, policy.minimumNoticeMinutes)
  const busy = context.busy.filter((period) => period.dentistId === dentistId)
  const starts: Date[] = []

  for (const window of workingWindows(schedule, date, policy.timeZone)) {
    for (
      let start = window.start;
      addMinutes(start, durationMinutes).getTime() <= window.end.getTime();
      start = addMinutes(start, policy.slotStepMinutes)
    ) {
      const candidate = { start, end: addMinutes(start, durationMinutes) }
      if (start.getTime() < earliestStart.getTime()) continue
      if (busy.some((period) => overlaps(candidate, period))) continue
      starts.push(start)
    }
  }

  return starts
}

export function computeDailySlots(date: LocalDate, context: AvailabilityContext): Slot[] {
  if (context.durationMinutes <= 0) return []
  if (context.holidays.has(date)) return []
  if (!isWithinHorizon(date, context.now, context.policy)) return []

  const byStart = new Map<number, string[]>()
  for (const dentistId of context.dentistIds) {
    for (const start of dentistSlotStarts(dentistId, date, context)) {
      const key = start.getTime()
      byStart.set(key, [...(byStart.get(key) ?? []), dentistId])
    }
  }

  return [...byStart.entries()]
    .sort(([left], [right]) => left - right)
    .map(([startMs, dentistIds]) => {
      const start = new Date(startMs)
      return { start, end: addMinutes(start, context.durationMinutes), dentistIds }
    })
}

export type DaySummary = { readonly date: LocalDate; readonly slotCount: number }

export function summarizeDays(context: AvailabilityContext): DaySummary[] {
  const { first, last } = bookableDateRange(context.now, context.policy)
  const days: DaySummary[] = []
  for (let date = first; compareLocalDates(date, last) <= 0; date = addDays(date, 1)) {
    days.push({ date, slotCount: computeDailySlots(date, context).length })
  }
  return days
}

export function findSlot(
  date: LocalDate,
  start: Date,
  context: AvailabilityContext,
): Slot | undefined {
  return computeDailySlots(date, context).find((slot) => slot.start.getTime() === start.getTime())
}

export function rankDentistsForSlot(slot: Slot, context: AvailabilityContext): string[] {
  const date = toLocalDate(slot.start, context.policy.timeZone)
  const workload = (dentistId: string) =>
    context.busy.filter(
      (period) =>
        period.dentistId === dentistId &&
        toLocalDate(period.start, context.policy.timeZone) === date,
    ).length
  const order = new Map(context.dentistIds.map((id, index) => [id, index]))

  return [...slot.dentistIds].sort(
    (left, right) =>
      workload(left) - workload(right) || (order.get(left) ?? 0) - (order.get(right) ?? 0),
  )
}
