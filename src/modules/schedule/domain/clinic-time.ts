import { TZDate } from '@date-fns/tz'

declare const localDateBrand: unique symbol
declare const localTimeBrand: unique symbol

export type LocalDate = string & { readonly [localDateBrand]: true }
export type LocalTime = string & { readonly [localTimeBrand]: true }

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const LOCAL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::00)?$/
const MINUTE_MS = 60_000

export function isLocalDate(value: string): value is LocalDate {
  const match = LOCAL_DATE_PATTERN.exec(value)
  if (!match) return false
  const [, year, month, day] = match.map(Number) as [number, number, number, number]
  const probe = new Date(Date.UTC(year, month - 1, day))
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  )
}

export function parseLocalDate(value: string): LocalDate {
  if (!isLocalDate(value)) throw new RangeError(`Invalid local date: ${value}`)
  return value
}

export function parseLocalTime(value: string): LocalTime {
  const match = LOCAL_TIME_PATTERN.exec(value)
  if (!match) throw new RangeError(`Invalid local time: ${value}`)
  return `${match[1]}:${match[2]}` as LocalTime
}

function dateParts(date: LocalDate): [number, number, number] {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number]
  return [year, month, day]
}

function timeParts(time: LocalTime): [number, number] {
  const [hours, minutes] = time.split(':').map(Number) as [number, number]
  return [hours, minutes]
}

export function weekdayOf(date: LocalDate): number {
  const [year, month, day] = dateParts(date)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function addDays(date: LocalDate, days: number): LocalDate {
  const [year, month, day] = dateParts(date)
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return shifted.toISOString().slice(0, 10) as LocalDate
}

export function compareLocalDates(left: LocalDate, right: LocalDate): number {
  return left < right ? -1 : left > right ? 1 : 0
}

export function toInstant(date: LocalDate, time: LocalTime, timeZone: string): Date {
  const [year, month, day] = dateParts(date)
  const [hours, minutes] = timeParts(time)
  return new Date(new TZDate(year, month - 1, day, hours, minutes, timeZone).getTime())
}

export function toLocalDate(instant: Date, timeZone: string): LocalDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('year')}-${pick('month')}-${pick('day')}` as LocalDate
}

export function toLocalTime(instant: Date, timeZone: string): LocalTime {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('hour')}:${pick('minute')}` as LocalTime
}

export function addMinutes(instant: Date, minutes: number): Date {
  return new Date(instant.getTime() + minutes * MINUTE_MS)
}

export function minutesBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MINUTE_MS)
}
