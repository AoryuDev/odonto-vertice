import { Link } from '@/i18n/navigation'
import { ArrowRightIcon } from '@/components/ui/icons'
import { formatDuration } from '@/lib/format'
import { bookingHref } from '@/modules/booking/booking-routes'
import type { Treatment } from '@/modules/catalog/types'
import { StepHeading } from './step-heading'

export function TreatmentStep({ treatments }: { treatments: readonly Treatment[] }) {
  return (
    <>
      <StepHeading title="Qual consulta você quer marcar?">
        Na dúvida, escolha avaliação: o dentista examina e monta o plano com você.
      </StepHeading>
      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {treatments.map((treatment) => (
          <li key={treatment.id}>
            <Link
              href={bookingHref({ treatment: treatment.slug })}
              className="group flex h-full items-start justify-between gap-4 rounded-[var(--radius-soft)] border border-line bg-card p-5 transition-colors hover:border-pine-700"
            >
              <span>
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-[1.45rem] leading-tight text-ink">
                    {treatment.name}
                  </span>
                  <span className="text-sm text-ink-soft tabular">
                    {formatDuration(treatment.durationMinutes)}
                  </span>
                </span>
                <span className="mt-1.5 block text-[0.95rem] text-ink-soft">
                  {treatment.summary}
                </span>
              </span>
              <ArrowRightIcon className="mt-1.5 shrink-0 text-pine-800 transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
