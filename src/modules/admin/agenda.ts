import type { WeeklySchedule } from '@/modules/schedule/domain/availability'
import {
  addDays,
  toInstant,
  toLocalDate,
  weekdayOf,
  type LocalDate,
  type LocalTime,
} from '@/modules/schedule/domain/clinic-time'

export type AppointmentStatus = 'scheduled' | 'cancelled' | 'completed' | 'no_show'

export type AgendaAppointment = {
  readonly kind: 'appointment'
  readonly id: string
  readonly dentistId: string
  readonly start: Date
  readonly end: Date
  readonly status: AppointmentStatus
  readonly patientName: string
  readonly treatmentName: string
  readonly paymentMethod: 'private' | 'insurance'
  readonly insuranceProvider: string | null
}

export type AgendaBlock = {
  readonly kind: 'block'
  readonly id: string
  readonly dentistId: string
  readonly start: Date
  readonly end: Date
  readonly reason: string
}

export type AgendaEntry = AgendaAppointment | AgendaBlock

export type TimeWindow = { readonly start: Date; readonly end: Date }

export type Placement = { readonly topPercent: number; readonly heightPercent: number }

export function dayWindow(
  date: LocalDate,
  from: LocalTime,
  to: LocalTime,
  timeZone: string,
): TimeWindow {
  return { start: toInstant(date, from, timeZone), end: toInstant(date, to, timeZone) }
}

export function placeInWindow(interval: TimeWindow, window: TimeWindow): Placement | null {
  const total = window.end.getTime() - window.start.getTime()
  const start = Math.max(interval.start.getTime(), window.start.getTime())
  const end = Math.min(interval.end.getTime(), window.end.getTime())
  if (total <= 0 || end <= start) return null
  return {
    topPercent: ((start - window.start.getTime()) / total) * 100,
    heightPercent: ((end - start) / total) * 100,
  }
}

export function offHoursBands(
  schedule: WeeklySchedule | undefined,
  date: LocalDate,
  window: TimeWindow,
  timeZone: string,
): Placement[] {
  if (!schedule || schedule.weekday !== weekdayOf(date)) {
    return [{ topPercent: 0, heightPercent: 100 }]
  }
  const at = (time: LocalTime) => toInstant(date, time, timeZone)
  const closed: TimeWindow[] = [
    { start: window.start, end: at(schedule.startsAt) },
    { start: at(schedule.endsAt), end: window.end },
  ]
  if (schedule.lunch)
    closed.push({ start: at(schedule.lunch.startsAt), end: at(schedule.lunch.endsAt) })
  return closed.flatMap((band) => placeInWindow(band, window) ?? [])
}

export function workWeek(date: LocalDate): LocalDate[] {
  const monday = addDays(date, -((weekdayOf(date) + 6) % 7))
  return Array.from({ length: 6 }, (_, index) => addDays(monday, index))
}

export function groupByDate<T extends { start: Date }>(
  entries: readonly T[],
  timeZone: string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const entry of [...entries].sort(
    (left, right) => left.start.getTime() - right.start.getTime(),
  )) {
    const key = toLocalDate(entry.start, timeZone)
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  return groups
}

export type AgendaStats = Record<AppointmentStatus, number>

export function agendaStats(entries: readonly AgendaEntry[]): AgendaStats {
  const stats: AgendaStats = { scheduled: 0, completed: 0, no_show: 0, cancelled: 0 }
  for (const entry of entries) if (entry.kind === 'appointment') stats[entry.status] += 1
  return stats
}

export function isVisible(entry: AgendaEntry, showCancelled: boolean): boolean {
  return showCancelled || entry.kind === 'block' || entry.status !== 'cancelled'
}
