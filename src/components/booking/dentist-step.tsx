import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ArrowRightIcon, CalendarIcon } from '@/components/ui/icons'
import { dentistPhoto } from '@/content/photos'
import { currentLocale } from '@/i18n/server'
import { getWeekdayLabels } from '@/i18n/weekday-labels'
import { bookingHref } from '@/modules/booking/booking-routes'
import { ANY_DENTIST } from '@/modules/booking/schemas'
import type { Dentist, Treatment } from '@/modules/catalog/types'
import { StepHeading } from './step-heading'

export async function DentistStep({
  treatment,
  dentists,
}: {
  treatment: Treatment
  dentists: readonly Dentist[]
}) {
  const locale = await currentLocale()
  const [t, tSpecialty, weekdays] = await Promise.all([
    getTranslations({ locale, namespace: 'booking.dentistStep' }),
    getTranslations({ locale, namespace: 'specialty' }),
    getWeekdayLabels(locale),
  ])
  return (
    <>
      <StepHeading title={dentists.length > 1 ? t('titleMany') : t('titleOne')}>
        {dentists.length > 1
          ? t('bodyMany', { treatmentLower: treatment.name.toLowerCase() })
          : t('bodyOne', {
              treatment: treatment.name,
              dentist: dentists[0]?.displayName ?? t('team'),
            })}
      </StepHeading>
      <ul className="mt-8 grid gap-3">
        {dentists.length > 1 ? (
          <li>
            <Link
              href={bookingHref({ treatment: treatment.slug, dentist: ANY_DENTIST })}
              className="group flex items-center gap-4 rounded-[var(--radius-soft)] border border-pine-700 bg-pine-100/60 p-4 transition-colors hover:bg-pine-100"
            >
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-pine-800 text-paper">
                <CalendarIcon size={26} />
              </span>
              <span className="flex-1">
                <span className="block font-display text-[1.45rem] leading-tight text-ink">
                  {t('anyTitle')}
                </span>
                <span className="block text-[0.95rem] text-ink-soft">{t('anyBody')}</span>
              </span>
              <ArrowRightIcon className="shrink-0 text-pine-800 transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ) : null}
        {dentists.map((dentist) => {
          const photo = dentistPhoto(dentist.photoKey)
          return (
            <li key={dentist.id}>
              <Link
                href={bookingHref({ treatment: treatment.slug, dentist: dentist.slug })}
                className="group flex items-center gap-4 rounded-[var(--radius-soft)] border border-line bg-card p-4 transition-colors hover:border-pine-700"
              >
                <Image
                  src={photo.src}
                  alt=""
                  placeholder="blur"
                  sizes="4rem"
                  className="size-16 shrink-0 rounded-full object-cover object-top"
                />
                <span className="flex-1">
                  <span className="block font-display text-[1.45rem] leading-tight text-ink">
                    {dentist.displayName}
                  </span>
                  <span className="block text-[0.95rem] text-ink-soft">
                    {tSpecialty(dentist.specialty)} · {weekdays.seesPatients(dentist.schedules)}
                  </span>
                </span>
                <ArrowRightIcon className="shrink-0 text-pine-800 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
