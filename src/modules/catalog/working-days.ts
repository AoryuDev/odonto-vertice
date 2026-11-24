import type { WeeklySchedule } from '@/modules/schedule/domain/availability'

export type WorkingDays =
  | { readonly kind: 'span'; readonly first: number; readonly last: number }
  | { readonly kind: 'list'; readonly days: readonly number[] }

export function describeWorkingDays(schedules: readonly WeeklySchedule[]): WorkingDays {
  const days = [...new Set(schedules.map((schedule) => schedule.weekday))].sort(
    (left, right) => ((left + 6) % 7) - ((right + 6) % 7),
  )
  const isRun = days.every((day, index) => index === 0 || day === ((days[index - 1] ?? 0) + 1) % 7)
  const first = days[0]
  const last = days.at(-1)
  if (days.length >= 3 && isRun && first !== undefined && last !== undefined) {
    return { kind: 'span', first, last }
  }
  return { kind: 'list', days }
}
