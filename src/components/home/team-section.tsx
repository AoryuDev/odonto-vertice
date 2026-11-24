import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/site/motion'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ArrowRightIcon } from '@/components/ui/icons'
import { dentistPhoto } from '@/content/photos'
import { cn } from '@/lib/cn'
import { listDentists } from '@/modules/catalog/catalog.repository'
import { SPECIALTY_LABELS, type Dentist } from '@/modules/catalog/types'
import { describeWorkingDays } from '@/modules/catalog/working-days'

export async function TeamSection() {
  const dentists = await listDentists()
  const [lead, ...others] = [...dentists].sort(
    (left, right) => Number(right.isTechnicalLead) - Number(left.isTechnicalLead),
  )

  return (
    <section id="equipe" className="bg-paper-deep py-20 md:py-28">
      <div className="container-page">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow>Equipe</Eyebrow>
            <h2 className="mt-5 text-title text-ink">Três especialistas, um prontuário só.</h2>
          </div>
          <p className="text-ink-soft md:col-span-5">
            Quando o caso envolve aparelho ou implante, o especialista já recebe o seu histórico.
            Você não precisa repetir tudo a cada consulta.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-12 md:gap-8">
          {lead ? <LeadDentist dentist={lead} /> : null}
          <div className="grid gap-6 md:col-span-6 md:gap-8">
            {others.map((dentist, index) => (
              <Reveal key={dentist.id} delay={index * 0.08}>
                <CompactDentist dentist={dentist} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LeadDentist({ dentist }: { dentist: Dentist }) {
  const photo = dentistPhoto(dentist.photoKey)
  return (
    <Link
      href={`/equipe/${dentist.slug}`}
      className="group relative block overflow-hidden rounded-[var(--radius-card)] bg-pine-900 text-paper md:col-span-6"
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        placeholder="blur"
        sizes="(min-width: 768px) 46vw, 100vw"
        className="aspect-[4/5] w-full object-cover object-top opacity-95 transition-transform duration-700 group-hover:scale-[1.02] md:aspect-[5/6]"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine-950/95 via-pine-950/60 to-transparent p-6 pt-20 md:p-8 md:pt-32">
        <p className="text-[0.78rem] font-semibold tracking-[0.12em] text-clay-200 uppercase">
          {SPECIALTY_LABELS[dentist.specialty]} · Responsável técnica
        </p>
        <p className="mt-2 font-display text-[2rem] leading-tight">{dentist.displayName}</p>
        <p className="mt-2 hidden max-w-md text-[0.95rem] text-pine-100 sm:block">
          {dentist.headline}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
          {describeWorkingDays(dentist.schedules)}
          <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  )
}

function CompactDentist({ dentist }: { dentist: Dentist }) {
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
        alt={photo.alt}
        placeholder="blur"
        sizes="10rem"
        className="aspect-[3/4] h-full w-full rounded-[1rem] object-cover object-top"
      />
      <div className="flex flex-col py-2">
        <p className="text-[0.78rem] font-semibold tracking-[0.12em] text-clay-600 uppercase">
          {SPECIALTY_LABELS[dentist.specialty]}
        </p>
        <p className="mt-2 font-display text-[1.6rem] leading-tight text-ink">
          {dentist.displayName}
        </p>
        <p className="mt-2 line-clamp-3 text-[0.95rem] text-ink-soft">{dentist.headline}</p>
        <p className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-pine-800">
          {describeWorkingDays(dentist.schedules)}
          <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  )
}
