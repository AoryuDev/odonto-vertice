import { getTranslations } from 'next-intl/server'
import { currentLocale } from '@/i18n/server'
import { formatHour } from '@/lib/format'
import { openingHours } from '@/modules/catalog/catalog.repository'
import { summarizeWeekHours } from '@/modules/schedule/domain/opening-hours'

export async function FactsStrip() {
  const locale = await currentLocale()
  const [t, hours] = await Promise.all([
    getTranslations({ locale, namespace: 'home.facts' }),
    openingHours(),
  ])
  const [weekdays, saturday] = summarizeWeekHours(hours)
  const schedule = [
    weekdays
      ? t('weekdayHours', {
          opens: formatHour(weekdays.opensAt, locale),
          closes: formatHour(weekdays.closesAt, locale),
        })
      : null,
    saturday ? t('saturdayHours', { closes: formatHour(saturday.closesAt, locale) }) : null,
  ]

  const facts = [
    { label: t('hoursLabel'), value: schedule.filter(Boolean).join(' · ') },
    { label: t('paymentLabel'), value: t('paymentValue') },
    { label: t('parkingLabel'), value: t('parkingValue') },
    { label: t('landmarkLabel'), value: t('landmarkValue') },
  ]

  return (
    <section aria-label={t('label')} className="border-y border-line bg-card/60">
      <dl className="container-page grid grid-cols-2 gap-x-6 gap-y-5 py-6 md:grid-cols-4 md:py-7">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="md:border-l md:border-line md:pl-6 md:first:border-l-0 md:first:pl-0"
          >
            <dt className="text-[0.78rem] font-semibold tracking-[0.12em] text-clay-600 uppercase">
              {fact.label}
            </dt>
            <dd className="mt-1 text-[0.98rem] leading-snug text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
