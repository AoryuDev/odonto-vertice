import { INTL_LOCALE } from '@/i18n/locales'
import type { AppLocale } from '@/i18n/routing'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'

const DATE_STYLES = {
  longDate: { weekday: 'long', day: 'numeric', month: 'long' },
  shortDate: { day: '2-digit', month: '2-digit' },
  weekdayShort: { weekday: 'short' },
  monthShort: { month: 'short' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>

const TIME_STYLES: Record<AppLocale, Intl.DateTimeFormatOptions> = {
  pt: { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
  en: { hour: 'numeric', minute: '2-digit', hour12: true },
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function dateFormatter(
  locale: AppLocale,
  key: string,
  options: Intl.DateTimeFormatOptions,
  timeZone = CLINIC_TIME_ZONE,
): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${key}:${timeZone}`
  const cached = dateFormatters.get(cacheKey)
  if (cached) return cached
  const formatter = new Intl.DateTimeFormat(INTL_LOCALE[locale], { ...options, timeZone })
  dateFormatters.set(cacheKey, formatter)
  return formatter
}

function withoutAbbreviationDot(value: string): string {
  return value.replace('.', '')
}

function keepTogether(value: string): string {
  return value.replace(/\s/g, '\u00a0')
}

export function formatLongDate(instant: Date, locale: AppLocale): string {
  return dateFormatter(locale, 'longDate', DATE_STYLES.longDate).format(instant)
}

export function formatShortDate(instant: Date, locale: AppLocale): string {
  return dateFormatter(locale, 'shortDate', DATE_STYLES.shortDate).format(instant)
}

export function formatTime(instant: Date, locale: AppLocale): string {
  return keepTogether(dateFormatter(locale, 'time', TIME_STYLES[locale]).format(instant))
}

export function formatWeekdayShort(instant: Date, locale: AppLocale): string {
  return withoutAbbreviationDot(
    dateFormatter(locale, 'weekdayShort', DATE_STYLES.weekdayShort).format(instant),
  )
}

export function formatMonthShort(instant: Date, locale: AppLocale): string {
  return withoutAbbreviationDot(
    dateFormatter(locale, 'monthShort', DATE_STYLES.monthShort).format(instant),
  )
}

const REFERENCE_SUNDAY = Date.UTC(2023, 0, 1, 12)
const DAY_MS = 24 * 60 * 60 * 1000

export function formatWeekday(weekday: number, locale: AppLocale, width: 'long' | 'short'): string {
  const instant = new Date(REFERENCE_SUNDAY + weekday * DAY_MS)
  return withoutAbbreviationDot(
    dateFormatter(locale, `weekday-${width}`, { weekday: width }, 'UTC').format(instant),
  )
}

const HOUR_STYLES: Record<AppLocale, (hours: number, minutes: string) => string> = {
  pt: (hours, minutes) => (minutes === '00' ? `${hours}h` : `${hours}h${minutes}`),
  en: (hours, minutes) =>
    keepTogether(
      dateFormatter(
        'en',
        minutes === '00' ? 'hour' : 'hourMinute',
        minutes === '00' ? { hour: 'numeric' } : { hour: 'numeric', minute: '2-digit' },
        'UTC',
      ).format(new Date(Date.UTC(1970, 0, 1, hours, Number(minutes)))),
    ),
}

export function formatHour(localTime: string, locale: AppLocale): string {
  const [hours = '0', minutes = '00'] = localTime.split(':')
  return HOUR_STYLES[locale](Number(hours), minutes)
}

export function formatDuration(minutes: number, locale: AppLocale): string {
  const unit = (value: number, name: 'hour' | 'minute') =>
    new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: 'unit',
      unit: name,
      unitDisplay: 'short',
    }).format(value)
  if (minutes < 60) return unit(minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${unit(hours, 'hour')} ${unit(rest, 'minute')}` : unit(hours, 'hour')
}

export function formatList(
  items: readonly string[],
  locale: AppLocale,
  type: 'conjunction' | 'disjunction' = 'conjunction',
): string {
  return new Intl.ListFormat(INTL_LOCALE[locale], { type }).format(items)
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function localDateNoon(date: string): Date {
  return new Date(`${date}T12:00:00-03:00`)
}
