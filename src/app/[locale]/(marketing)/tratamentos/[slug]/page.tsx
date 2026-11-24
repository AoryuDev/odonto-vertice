import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { FaqList } from '@/components/site/faq-list'
import { JsonLd } from '@/components/site/json-ld'
import { Reveal } from '@/components/site/motion'
import { ButtonLink } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ArrowRightIcon, CheckIcon, ClockIcon } from '@/components/ui/icons'
import { dentistPhoto, treatmentPhoto } from '@/content/photos'
import { currentLocale } from '@/i18n/server'
import { getWeekdayLabels } from '@/i18n/weekday-labels'
import { formatDuration } from '@/lib/format'
import { absoluteUrl } from '@/lib/site'
import { findTreatment, listDentists, listTreatments } from '@/modules/catalog/catalog.repository'
import { breadcrumbSchema, treatmentSchema } from '@/modules/catalog/structured-data'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await listTreatments()).map((treatment) => ({ slug: treatment.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const treatment = await findTreatment((await params).slug)
  if (!treatment) return {}
  const photo = treatmentPhoto(treatment.photoKey)
  const tPhoto = await getTranslations('photoAlt')
  const title = `${treatment.name} no Setor Bueno, Goiânia`
  return {
    title,
    description: treatment.summary,
    alternates: { canonical: `/tratamentos/${treatment.slug}` },
    openGraph: {
      title: `${title} · Odonto Vértice`,
      description: treatment.summary,
      url: `/tratamentos/${treatment.slug}`,
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

export default async function TreatmentPage({ params }: Props) {
  const { slug } = await params
  const locale = await currentLocale()
  const [t, tCrumbs, tSpecialty, tPhoto, weekdays, treatment, treatments, dentists] =
    await Promise.all([
      getTranslations({ locale, namespace: 'treatmentPage' }),
      getTranslations({ locale, namespace: 'breadcrumbs' }),
      getTranslations({ locale, namespace: 'specialty' }),
      getTranslations({ locale, namespace: 'photoAlt' }),
      getWeekdayLabels(locale),
      findTreatment(slug),
      listTreatments(),
      listDentists(),
    ])
  if (!treatment) notFound()

  const photo = treatmentPhoto(treatment.photoKey)
  const team = dentists.filter((dentist) => treatment.dentistIds.includes(dentist.id))
  const others = treatments.filter((candidate) => candidate.id !== treatment.id)
  const { content } = treatment
  const crumbs = [
    { name: tCrumbs('home'), path: '/' },
    { name: tCrumbs('treatments'), path: '/#tratamentos' },
    { name: treatment.name, path: `/tratamentos/${treatment.slug}` },
  ]

  return (
    <>
      <JsonLd data={treatmentSchema(treatment, absoluteUrl(photo.src.src))} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      {content.faqs.length > 0 ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: content.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }}
        />
      ) : null}

      <section className="container-page pt-8 pb-14 md:pt-12 md:pb-20">
        <Breadcrumbs items={crumbs} />
        <div className="mt-8 grid gap-10 md:grid-cols-12 md:items-end md:gap-10">
          <div className="md:col-span-7">
            <Eyebrow>{treatment.isUrgent ? t('eyebrowUrgent') : t('eyebrow')}</Eyebrow>
            <h1 className="mt-5 text-display text-ink">{treatment.name}</h1>
            <p className="mt-6 max-w-xl text-lead text-ink-soft">{treatment.summary}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink href={`/agendar/${treatment.slug}`} size="lg">
                {t('book', { treatment: treatment.name.toLowerCase() })}
              </ButtonLink>
              <span className="inline-flex items-center gap-2 text-ink-soft">
                <ClockIcon size={18} />
                {t('duration', { duration: formatDuration(treatment.durationMinutes, locale) })}
              </span>
            </div>
          </div>
          <div className="md:col-span-5">
            <Image
              src={photo.src}
              alt={tPhoto(photo.altKey)}
              loading="eager"
              fetchPriority="high"
              placeholder="blur"
              sizes="(min-width: 768px) 38vw, 100vw"
              className="aspect-[4/3] w-full rounded-[var(--radius-card)] rounded-tr-[5rem] object-cover md:aspect-[5/6]"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-card/50">
        <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-24">
          <div className="space-y-14 md:col-span-7">
            <div className="prose-clinic max-w-2xl text-lg text-ink">
              {content.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {content.forWhom.length > 0 ? (
              <div>
                <h2 className="text-subtitle text-ink">{t('forWhom')}</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {content.forWhom.map((item) => (
                    <li key={item} className="flex gap-3 text-ink-soft">
                      <CheckIcon size={20} className="mt-0.5 shrink-0 text-pine-700" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {content.steps.length > 0 ? (
              <div>
                <h2 className="text-subtitle text-ink">{t('steps')}</h2>
                <ol className="mt-8 border-l border-line-strong">
                  {content.steps.map((step, index) => (
                    <li key={step.title} className="relative pb-8 pl-8 last:pb-0">
                      <span className="absolute top-0 -left-[0.95rem] flex size-[1.9rem] items-center justify-center rounded-full border border-line-strong bg-paper font-display text-sm text-clay-600 italic">
                        {index + 1}
                      </span>
                      <Reveal distance={8}>
                        <h3 className="font-sans text-lg font-semibold tracking-normal text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-ink-soft">{step.body}</p>
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="grid gap-10 sm:grid-cols-2">
              {content.preparation.length > 0 ? (
                <div>
                  <h2 className="text-subtitle text-ink">{t('preparation')}</h2>
                  <ul className="mt-5 space-y-3 text-ink-soft">
                    {content.preparation.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {content.aftercare.length > 0 ? (
                <div>
                  <h2 className="text-subtitle text-ink">{t('aftercare')}</h2>
                  <ul className="mt-5 space-y-3 text-ink-soft">
                    {content.aftercare.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="md:col-span-5 md:pl-6">
            <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6 md:sticky md:top-28">
              <h2 className="font-sans text-sm font-semibold tracking-[0.12em] text-clay-600 uppercase">
                {t('team')}
              </h2>
              <ul className="mt-5 space-y-4">
                {team.map((dentist) => {
                  const portrait = dentistPhoto(dentist.photoKey)
                  return (
                    <li key={dentist.id}>
                      <Link
                        href={`/equipe/${dentist.slug}`}
                        className="group flex items-center gap-4"
                      >
                        <Image
                          src={portrait.src}
                          alt=""
                          placeholder="blur"
                          sizes="4rem"
                          className="size-16 shrink-0 rounded-full object-cover object-top"
                        />
                        <span>
                          <span className="block font-display text-xl text-ink group-hover:text-pine-800">
                            {dentist.displayName}
                          </span>
                          <span className="block text-sm text-ink-soft">
                            {tSpecialty(dentist.specialty)} ·{' '}
                            {weekdays.workingDays(dentist.schedules)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <ButtonLink href={`/agendar/${treatment.slug}`} className="mt-6 w-full">
                {t('seeTimes')}
              </ButtonLink>
              <p className="mt-4 text-center text-sm text-ink-soft">{t('payment')}</p>
            </div>
          </aside>
        </div>
      </section>

      {content.faqs.length > 0 ? (
        <section className="container-page py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-12">
            <h2 className="text-title text-ink md:col-span-4">
              {t('faqTitle', { treatment: treatment.name.toLowerCase() })}
            </h2>
            <div className="md:col-span-8">
              <FaqList items={content.faqs} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-line">
        <div className="container-page py-14">
          <h2 className="font-sans text-sm font-semibold tracking-[0.12em] text-clay-600 uppercase">
            {t('others')}
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/tratamentos/${other.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-ink hover:border-pine-800 hover:text-pine-800"
                >
                  {other.name}
                  <ArrowRightIcon
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
