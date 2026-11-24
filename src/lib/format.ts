import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'

const longDate = new Intl.DateTimeFormat('pt-BR', {
  timeZone: CLINIC_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const shortDate = new Intl.DateTimeFormat('pt-BR', {
  timeZone: CLINIC_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
})

const time = new Intl.DateTimeFormat('pt-BR', {
  timeZone: CLINIC_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const weekdayShort = new Intl.DateTimeFormat('pt-BR', {
  timeZone: CLINIC_TIME_ZONE,
  weekday: 'short',
})

const monthShort = new Intl.DateTimeFormat('pt-BR', {
  timeZone: CLINIC_TIME_ZONE,
  month: 'short',
})

export function formatLongDate(instant: Date): string {
  return longDate.format(instant)
}

export function formatShortDate(instant: Date): string {
  return shortDate.format(instant)
}

export function formatTime(instant: Date): string {
  return time.format(instant)
}

export function formatWeekdayShort(instant: Date): string {
  return weekdayShort.format(instant).replace('.', '')
}

export function formatMonthShort(instant: Date): string {
  return monthShort.format(instant).replace('.', '')
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function localDateNoon(date: string): Date {
  return new Date(`${date}T12:00:00-03:00`)
}
