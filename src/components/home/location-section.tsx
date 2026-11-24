import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import mapImage from '@/assets/map-setor-bueno.png'
import { InteractiveMapToggle } from '@/components/site/interactive-map'
import { ButtonLink } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ArrowUpRightIcon, LogoMark } from '@/components/ui/icons'
import { photos } from '@/content/photos'
import { currentLocale } from '@/i18n/server'
import { getWeekdayLabels } from '@/i18n/weekday-labels'
import { formatHour } from '@/lib/format'
import { openingHours } from '@/modules/catalog/catalog.repository'
import { clinic, directionsUrl, formatAddressLine } from '@/modules/catalog/clinic'

export async function LocationSection() {
  const locale = await currentLocale()
  const [t, tMap, tClinic, tPhoto, weekdays, hours] = await Promise.all([
    getTranslations({ locale, namespace: 'home.location' }),
    getTranslations({ locale, namespace: 'map' }),
    getTranslations({ locale, namespace: 'clinic' }),
    getTranslations({ locale, namespace: 'photoAlt' }),
    getWeekdayLabels(locale),
    openingHours(),
  ])

  return (
    <section id="localizacao" className="bg-paper-deep py-20 md:py-28">
      <div className="container-page grid gap-10 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-line-strong bg-card md:aspect-auto md:h-full md:min-h-[32rem]">
            <InteractiveMapToggle
              latitude={clinic.geo.latitude}
              longitude={clinic.geo.longitude}
              labels={{ title: tMap('title'), open: tMap('open') }}
            >
              <Image
                src={mapImage}
                alt={t('mapAlt', { street: clinic.address.street.split(',')[0] ?? '' })}
                placeholder="blur"
                sizes="(min-width: 768px) 56vw, 100vw"
                className="size-full object-cover [filter:grayscale(0.8)_sepia(0.22)_contrast(0.94)_brightness(1.04)]"
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(100%+4px)]"
              >
                <span className="flex size-14 rotate-45 items-center justify-center rounded-full rounded-br-none bg-pine-800 text-paper shadow-[0_10px_24px_-10px_rgba(21,58,47,0.8)]">
                  <LogoMark size={26} className="-rotate-45" />
                </span>
              </span>
            </InteractiveMapToggle>
            <p className="absolute bottom-2 left-3 rounded bg-card/90 px-1.5 text-[0.7rem] text-ink-soft">
              {tMap.rich('attribution', {
                link: (chunks) => (
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:col-span-5">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h2 className="mt-5 text-title text-ink">{t('title')}</h2>
          <address className="mt-6 text-lg text-ink not-italic">
            {formatAddressLine()}
            <span className="mt-1 block text-[0.98rem] text-ink-soft">
              {tClinic('landmark')} {tClinic('parking')}
            </span>
          </address>

          <table className="mt-8 w-full text-[0.98rem]">
            <caption className="sr-only">{t('hoursCaption')}</caption>
            <tbody>
              {hours.map((entry) => (
                <tr key={entry.weekday} className="border-b border-line-strong/60">
                  <th scope="row" className="py-2.5 text-left font-normal text-ink-soft">
                    {weekdays.long(entry.weekday)}
                  </th>
                  <td className="py-2.5 text-right text-ink tabular">
                    {t('hoursRange', {
                      opens: formatHour(entry.opensAt, locale),
                      closes: formatHour(entry.closesAt, locale),
                    })}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-2.5 text-left font-normal text-ink-soft">
                  {t('closedDays')}
                </th>
                <td className="py-2.5 text-right text-ink-soft">{t('closed')}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={directionsUrl()} target="_blank" rel="noopener noreferrer">
              {t('directions')}
              <ArrowUpRightIcon size={18} />
            </ButtonLink>
            <ButtonLink href={`tel:${clinic.phone.e164}`} variant="secondary">
              {t.rich('call', {
                phone: clinic.phone.display,
                tabular: (chunks) => <span className="tabular">{chunks}</span>,
              })}
            </ButtonLink>
          </div>

          <div className="mt-10 hidden items-center gap-4 md:flex">
            <Image
              src={photos.reception.src}
              alt={tPhoto(photos.reception.altKey)}
              placeholder="blur"
              sizes="7rem"
              className="size-20 shrink-0 rounded-full object-cover"
            />
            <p className="text-sm text-ink-soft">{t('reception')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
