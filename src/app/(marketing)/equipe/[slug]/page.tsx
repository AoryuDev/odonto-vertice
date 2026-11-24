import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Breadcrumbs } from '@/components/site/breadcrumbs'
import { JsonLd } from '@/components/site/json-ld'
import { PageSkeleton } from '@/components/site/page-skeleton'
import { ButtonLink } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ArrowUpRightIcon } from '@/components/ui/icons'
import { dentistPhoto } from '@/content/photos'
import { formatDuration, formatHour } from '@/lib/format'
import { absoluteUrl } from '@/lib/site'
import { findDentist, listDentists, listTreatments } from '@/modules/catalog/catalog.repository'
import { breadcrumbSchema, dentistPersonSchema } from '@/modules/catalog/structured-data'
import { SPECIALTY_LABELS } from '@/modules/catalog/types'
import { WEEKDAY_LABELS } from '@/modules/schedule/domain/opening-hours'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await listDentists()).map((dentist) => ({ slug: dentist.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dentist = await findDentist((await params).slug)
  if (!dentist) return {}
  const photo = dentistPhoto(dentist.photoKey)
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
        { url: photo.src.src, width: photo.src.width, height: photo.src.height, alt: photo.alt },
      ],
    },
  }
}

export default function DentistPage({ params }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DentistContent params={params} />
    </Suspense>
  )
}

async function DentistContent({ params }: Props) {
  const { slug } = await params
  const [dentist, treatments] = await Promise.all([findDentist(slug), listTreatments()])
  if (!dentist) notFound()

  const photo = dentistPhoto(dentist.photoKey)
  const offered = treatments.filter((treatment) => dentist.treatmentIds.includes(treatment.id))
  const schedule = [...dentist.schedules].sort(
    (left, right) => ((left.weekday + 6) % 7) - ((right.weekday + 6) % 7),
  )
  const crumbs = [
    { name: 'Início', path: '/' },
    { name: 'Equipe', path: '/#equipe' },
    { name: dentist.displayName, path: `/equipe/${dentist.slug}` },
  ]

  return (
    <>
      <JsonLd data={dentistPersonSchema(dentist, absoluteUrl(photo.src.src))} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <section className="container-page pt-8 pb-16 md:pt-12 md:pb-24">
        <Breadcrumbs items={crumbs} />
        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute top-6 -right-3 -bottom-3 left-6 rounded-[var(--radius-card)] bg-pine-100"
              />
              <Image
                src={photo.src}
                alt={photo.alt}
                priority
                placeholder="blur"
                sizes="(min-width: 768px) 38vw, 100vw"
                className="relative aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover object-top"
              />
            </div>
          </div>

          <div className="md:col-span-7 md:pt-4">
            <Eyebrow>
              {SPECIALTY_LABELS[dentist.specialty]}
              {dentist.isTechnicalLead ? ' · Responsável técnica' : ''}
            </Eyebrow>
            <h1 className="mt-5 text-display text-ink">{dentist.displayName}</h1>
            <p className="mt-3 text-ink-soft">
              {dentist.fullName} · <span className="tabular">{dentist.croRegistration}</span>
            </p>
            <p className="mt-8 font-display text-subtitle text-pine-800 italic">
              {dentist.headline}
            </p>
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
              <ButtonLink href={`/agendar?dentista=${dentist.slug}`} size="lg">
                Agendar com {dentist.displayName.split(' ').slice(0, 2).join(' ')}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper-deep">
        <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-24">
          <div className="md:col-span-5">
            <h2 className="text-title text-ink">Dias de atendimento</h2>
            <table className="mt-8 w-full text-[0.98rem]">
              <caption className="sr-only">Agenda semanal de {dentist.displayName}</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Dia</th>
                  <th scope="col">Horário</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((entry) => (
                  <tr key={entry.weekday} className="border-b border-line-strong/60">
                    <th scope="row" className="py-3 text-left font-normal text-ink">
                      {WEEKDAY_LABELS[entry.weekday]}
                    </th>
                    <td className="py-3 text-right text-ink-soft tabular">
                      {entry.lunch
                        ? `${formatHour(entry.startsAt)}–${formatHour(entry.lunch.startsAt)} · ${formatHour(entry.lunch.endsAt)}–${formatHour(entry.endsAt)}`
                        : `${formatHour(entry.startsAt)}–${formatHour(entry.endsAt)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-ink-soft">
              Não há atendimento em feriados. Os horários livres aparecem no agendamento.
            </p>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <h2 className="text-title text-ink">O que atende</h2>
            <ul className="mt-8 border-t border-line-strong/60">
              {offered.map((treatment) => (
                <li key={treatment.id} className="border-b border-line-strong/60">
                  <Link
                    href={`/agendar?tratamento=${treatment.slug}&dentista=${dentist.slug}`}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span>
                      <span className="block font-display text-[1.45rem] text-ink group-hover:text-pine-800">
                        {treatment.name}
                      </span>
                      <span className="text-sm text-ink-soft">
                        {formatDuration(treatment.durationMinutes)}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-pine-800">
                      Ver horários
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
