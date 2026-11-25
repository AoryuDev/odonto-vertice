import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/site/motion'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ArrowRightIcon } from '@/components/ui/icons'
import { dentistPhoto } from '@/content/photos'
import { currentLocale } from '@/i18n/server'
import { getWeekdayLabels } from '@/i18n/weekday-labels'
import { cn } from '@/lib/cn'
import { listDentists } from '@/modules/catalog/catalog.repository'
import type { Dentist } from '@/modules/catalog/types'

type DentistCardText = {
  readonly specialty: string
  readonly workingDays: string
  readonly photoAlt: string
}

export async function TeamSection() {
  const locale = await currentLocale()
  const [t, tSpecialty, tPhoto, weekdays, dentists] = await Promise.all([
    getTranslations({ locale, namespace: 'home.team' }),
    getTranslations({ locale, namespace: 'specialty' }),
    getTranslations({ locale, namespace: 'photoAlt' }),
    getWeekdayLabels(locale),
    listDentists(locale),
  ])
  const textFor = (dentist: Dentist): DentistCardText => ({
    specialty: tSpecialty(dentist.specialty),
    workingDays: weekdays.seesPatients(dentist.schedules),
    photoAlt: tPhoto(dentistPhoto(dentist.photoKey).altKey),
  })
  const [lead, ...others] = [...dentists].sort(
    (left, right) => Number(right.isTechnicalLead) - Number(left.isTechnicalLead),
  )

  return (
    <section id="equipe" className="bg-paper-deep py-20 md:py-28">
      <div className="container-page">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <h2 className="mt-5 text-title text-ink">{t('title')}</h2>
          </div>
          <p className="text-ink-soft md:col-span-5">{t('body')}</p>
        </div>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-12 md:gap-8">
          {lead ? (
            <LeadDentist
              dentist={lead}
              text={textFor(lead)}
              role={t('leadRole', { specialty: tSpecialty(lead.specialty) })}
            />
          ) : null}
          <div className="grid gap-6 md:col-span-6 md:gap-8">
            {others.map((dentist, index) => (
              <Reveal key={dentist.id} delay={index * 0.08}>
                <CompactDentist dentist={dentist} text={textFor(dentist)} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LeadDentist({
  dentist,
  text,
  role,
}: {
  dentist: Dentist
  text: DentistCardText
  role: string
}) {
  const photo = dentistPhoto(dentist.photoKey)
  return (
    <Link
      href={`/equipe/${dentist.slug}`}
      className="group relative block overflow-hidden rounded-[var(--radius-card)] bg-pine-900 text-paper md:col-span-6"
    >
      <Image
        src={photo.src}
        alt={text.photoAlt}
        placeholder="blur"
        sizes="(min-width: 768px) 46vw, 100vw"
        className="aspect-[4/5] w-full object-cover object-top opacity-95 transition-transform duration-700 group-hover:scale-[1.02] md:aspect-[5/6]"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine-950/95 via-pine-950/60 to-transparent p-6 pt-20 md:p-8 md:pt-32">
        <p className="text-[0.78rem] font-semibold tracking-[0.12em] text-clay-200 uppercase">
          {role}
        </p>
        <p className="mt-2 font-display text-[2rem] leading-tight">{dentist.displayName}</p>
        <p className="mt-2 hidden max-w-md text-[0.95rem] text-pine-100 sm:block">
          {dentist.headline}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
          {text.workingDays}
          <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  )
}

function CompactDentist({ dentist, text }: { dentist: Dentist; text: DentistCardText }) {
  const photo = dentistPhoto(dentist.photoKey)
  return (
    <Link
      href={`/equipe/${dentist.slug}`}
      className={cn(
        'group grid grid-cols-[7.5rem_1fr] gap-5 rounded-[var(--radius-card)] border border-line bg-card p-3 pr-5 transition-colors hover:border-pine-300 sm:grid-cols-[10rem_1fr] md:h-full',
      )}
    >
      <Image
        src={photo.src}
        alt={text.photoAlt}
        placeholder="blur"
        sizes="10rem"
        className="aspect-[3/4] h-full w-full rounded-[1rem] object-cover object-top"
      />
      <div className="flex flex-col py-2">
        <p className="text-[0.78rem] font-semibold tracking-[0.12em] text-clay-600 uppercase">
          {text.specialty}
        </p>
        <p className="mt-2 font-display text-[1.6rem] leading-tight text-ink">
          {dentist.displayName}
        </p>
        <p className="mt-2 line-clamp-3 text-[0.95rem] text-ink-soft">{dentist.headline}</p>
        <p className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-pine-800">
          {text.workingDays}
          <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  )
}
