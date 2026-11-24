import type { WeeklySchedule } from '@/modules/schedule/domain/availability'
import { WEEKDAY_SHORT_LABELS } from '@/modules/schedule/domain/opening-hours'

export function describeWorkingDays(schedules: readonly WeeklySchedule[]): string {
  const days = [...new Set(schedules.map((schedule) => schedule.weekday))].sort(
    (left, right) => ((left + 6) % 7) - ((right + 6) % 7),
  )
  const labels = days.map((day) => WEEKDAY_SHORT_LABELS[day]?.toLowerCase() ?? '')
  const isRun = days.every((day, index) => index === 0 || day === ((days[index - 1] ?? 0) + 1) % 7)
  if (days.length >= 3 && isRun) return `Atende de ${labels[0]} a ${labels.at(-1)}`
  if (labels.length <= 1) return `Atende ${labels[0] ?? ''}`
  return `Atende ${labels.slice(0, -1).join(', ')} e ${labels.at(-1)}`
}
