import 'server-only'
import { getTranslations } from 'next-intl/server'
import { capitalize, formatList, formatWeekday } from '@/lib/format'
import { describeWorkingDays } from '@/modules/catalog/working-days'
import type { WeeklySchedule } from '@/modules/schedule/domain/availability'
import type { AppLocale } from './routing'

const WORKWEEK_LENGTH = 5

export async function getWeekdayLabels(locale: AppLocale) {
  const t = await getTranslations({ locale, namespace: 'weekdays' })
  const short = (weekday: number) => formatWeekday(weekday, locale, 'short')
  const long = (weekday: number) => capitalize(formatWeekday(weekday, locale, 'long'))

  const workingDays = (schedules: readonly WeeklySchedule[]) => {
    const description = describeWorkingDays(schedules)
    return description.kind === 'span'
      ? t('workingSpan', { first: short(description.first), last: short(description.last) })
      : formatList(description.days.map(short), locale)
  }

  return {
    long,
    group(weekdays: readonly number[]): string {
      const first = weekdays[0]
      const last = weekdays.at(-1)
      if (first === undefined || last === undefined) return ''
      if (weekdays.length === 1) return long(first)
      if (weekdays.length === WORKWEEK_LENGTH && first === 1) return t('mondayToFriday')
      const labels = { first: capitalize(short(first)), last: capitalize(short(last)) }
      return weekdays.length === 2 ? t('pair', labels) : t('span', labels)
    },
    workingDays,
    seesPatients: (schedules: readonly WeeklySchedule[]) =>
      t('seesPatients', { days: workingDays(schedules) }),
  }
}
