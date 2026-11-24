import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Fragment } from 'react'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { JsonLd } from '@/components/site/json-ld'
import { ButtonLink } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ArrowUpRightIcon } from '@/components/ui/icons'
import { dentistPhoto } from '@/content/photos'
import { currentLocale } from '@/i18n/server'
import { getWeekdayLabels } from '@/i18n/weekday-labels'
import { formatDuration, formatHour } from '@/lib/format'
import { absoluteUrl } from '@/lib/site'
import { findDentist, listDentists, listTreatments } from '@/modules/catalog/catalog.repository'
import { breadcrumbSchema, dentistPersonSchema } from '@/modules/catalog/structured-data'
import { SPECIALTY_LABELS } from '@/modules/catalog/types'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await listDentists()).map((dentist) => ({ slug: dentist.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dentist = await findDentist((await params).slug)
  if (!dentist) return {}
  const photo = dentistPhoto(dentist.photoKey)
  const tPhoto = await getTranslations('photoAlt')
  const title = `${dentist.displayName}, ${SPECIALTY_LABELS[dentist.specialty].toLowerCase()} em Goiânia`
  return {
    title,
    description: dentist.headline,
    alternates: { canonical: `/equipe/${dentist.slug}` },
    openGraph: {
      title: `${title} · Odonto Vértice`,
      description: dentist.headline,
      url: `/equipe/${dentist.slug}`,
      type: 'profile',
      images: [
        {
          url: photo.src.src,
          width: photo.src.width,
          height: photo.src.height,
          alt: tPhoto(photo.altKey),
        },
      ],
    },
  }
}

export const instant = false

export default async function DentistPage({ params }: Props) {
  const { slug } = await params
  const locale = await currentLocale()
  const [t, tCrumbs, tSpecialty, tPhoto, weekdays, dentist, treatments] = await Promise.all([
    getTranslations({ locale, namespace: 'dentistPage' }),
    getTranslations({ locale, namespace: 'breadcrumbs' }),
    getTranslations({ locale, namespace: 'specialty' }),
    getTranslations({ locale, namespace: 'photoAlt' }),
    getWeekdayLabels(locale),
    findDentist(slug),
    listTreatments(),
  ])
  if (!dentist) notFound()

  const photo = dentistPhoto(dentist.photoKey)
  const offered = treatments.filter((treatment) => dentist.treatmentIds.includes(treatment.id))
  const schedule = [...dentist.schedules].sort(
    (left, right) => ((left.weekday + 6) % 7) - ((right.weekday + 6) % 7),
  )
  const crumbs = [
    { name: tCrumbs('home'), path: '/' },
    { name: tCrumbs('team'), path: '/#equipe' },
    { name: dentist.displayName, path: `/equipe/${dentist.slug}` },
  ]

  return (
    <>
      <JsonLd data={dentistPersonSchema(dentist, absoluteUrl(photo.src.src))} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <section className="container-page pt-8 pb-16 md:pt-12 md:pb-24">
        <Breadcrumbs items={crumbs} />
        <div className="mt-8 grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-8 md:grid-cols-12 md:items-start md:gap-x-14">
          <div className="relative md:col-span-5 md:row-span-2">
            <div
              aria-hidden="true"
              className="absolute top-6 -right-3 -bottom-3 left-6 hidden rounded-[var(--radius-card)] bg-pine-100 md:block"
            />
            <Image
              src={photo.src}
              alt={tPhoto(photo.altKey)}
              loading="eager"
              fetchPriority="high"
              placeholder="blur"
              sizes="(min-width: 768px) 38vw, 6.5rem"
              className="relative aspect-[4/5] w-full rounded-[1rem] object-cover object-top md:rounded-[var(--radius-card)]"
            />
          </div>

          <div className="md:col-span-7 md:pt-4">
            <Eyebrow className="text-[0.72rem] md:text-[0.8rem]">
              {dentist.isTechnicalLead
                ? t('leadRole', { specialty: tSpecialty(dentist.specialty) })
                : tSpecialty(dentist.specialty)}
            </Eyebrow>
            <h1 className="mt-3 text-[2rem] leading-[1.05] text-ink md:mt-5 md:text-display">
              {dentist.displayName}
            </h1>
            <p className="mt-2 text-sm text-ink-soft md:mt-3 md:text-base">
              {dentist.fullName} · <span className="tabular">{dentist.croRegistration}</span>
            </p>
          </div>

          <div className="col-span-2 md:col-span-7 md:col-start-6">
            <p className="font-display text-subtitle text-pine-800 italic">{dentist.headline}</p>
            <div className="prose-clinic mt-6 max-w-2xl text-lg text-ink">
              {dentist.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {dentist.education.length > 0 ? (
              <ul className="mt-8 space-y-2 border-l-2 border-clay-200 pl-5 text-ink-soft">
                {dentist.education.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="#o-que-atende" size="lg">
                {t('book', { name: dentist.displayName.split(' ').slice(0, 2).join(' ') })}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper-deep">
        <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-24">
          <div className="md:col-span-5">
            <h2 className="text-title text-ink">{t('scheduleTitle')}</h2>
            <table className="mt-8 w-full text-[0.98rem]">
              <caption className="sr-only">
                {t('scheduleCaption', { name: dentist.displayName })}
              </caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">{t('day')}</th>
                  <th scope="col">{t('hours')}</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((entry) => (
                  <tr key={entry.weekday} className="border-b border-line-strong/60">
                    <th scope="row" className="py-3 text-left font-normal text-ink">
                      {weekdays.long(entry.weekday)}
                    </th>
                    <td className="py-3 text-right text-ink-soft tabular">
                      {(entry.lunch
                        ? [
                            { from: entry.startsAt, to: entry.lunch.startsAt },
                            { from: entry.lunch.endsAt, to: entry.endsAt },
                          ]
                        : [{ from: entry.startsAt, to: entry.endsAt }]
                      ).map((range, index) => (
                        <Fragment key={range.from}>
                          {index > 0 ? ' · ' : null}
                          <span className="whitespace-nowrap">
                            {formatHour(range.from, locale)}–{formatHour(range.to, locale)}
                          </span>
                        </Fragment>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-ink-soft">{t('scheduleNote')}</p>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <h2 id="o-que-atende" className="text-title text-ink">
              {t('offers')}
            </h2>
            <ul className="mt-8 border-t border-line-strong/60">
              {offered.map((treatment) => (
                <li key={treatment.id} className="border-b border-line-strong/60">
                  <Link
                    href={`/agendar/${treatment.slug}/${dentist.slug}`}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span>
                      <span className="block font-display text-[1.45rem] text-ink group-hover:text-pine-800">
                        {treatment.name}
                      </span>
                      <span className="text-sm text-ink-soft">
                        {formatDuration(treatment.durationMinutes, locale)}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-pine-800">
                      {t('seeTimes')}
                      <ArrowUpRightIcon size={16} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
