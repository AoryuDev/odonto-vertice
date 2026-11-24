import { useLocale, useTranslations } from 'next-intl'
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon } from '@/components/ui/icons'
import { capitalize, formatDuration, formatLongDate, formatTime } from '@/lib/format'
import { formatAddressLine } from '@/modules/catalog/clinic'

export function BookingSummary({
  treatmentName,
  durationMinutes,
  dentistLabel,
  startsAt,
}: {
  treatmentName: string
  durationMinutes: number
  dentistLabel: string
  startsAt: Date
}) {
  const locale = useLocale()
  const t = useTranslations('booking.summary')
  const rows = [
    {
      icon: CalendarIcon,
      label: t('when'),
      value: t('whenValue', {
        date: capitalize(formatLongDate(startsAt, locale)),
        time: formatTime(startsAt, locale),
      }),
    },
    {
      icon: ClockIcon,
      label: t('visit'),
      value: `${treatmentName} · ${formatDuration(durationMinutes, locale)}`,
    },
    { icon: UserIcon, label: t('dentist'), value: dentistLabel },
    { icon: MapPinIcon, label: t('where'), value: formatAddressLine() },
  ]
  return (
    <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card px-5">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-4 py-4">
          <row.icon size={20} className="mt-0.5 shrink-0 text-pine-700" />
          <div>
            <dt className="text-sm text-ink-soft">{row.label}</dt>
            <dd className="mt-0.5 text-ink">{row.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
