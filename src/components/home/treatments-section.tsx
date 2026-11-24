import Link from 'next/link'
import { Reveal } from '@/components/site/motion'
import { ButtonLink } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ArrowUpRightIcon } from '@/components/ui/icons'
import { formatDuration } from '@/lib/format'
import { listTreatments } from '@/modules/catalog/catalog.repository'

export async function TreatmentsSection() {
  const treatments = await listTreatments()

  return (
    <section id="tratamentos" className="container-page py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <Eyebrow>Tratamentos</Eyebrow>
            <h2 className="mt-5 text-title text-ink">
              Do check-up ao implante, no mesmo endereço.
            </h2>
            <p className="mt-5 text-ink-soft">
              Cada horário do site já considera a duração real da consulta. Se não souber qual
              escolher, marque uma avaliação: em meia hora você sai com um plano por escrito.
            </p>
            <ButtonLink href="/agendar?tratamento=avaliacao" variant="quiet" className="mt-6">
              Marcar uma avaliação
            </ButtonLink>
          </div>
        </div>

        <ol className="md:col-span-8">
          {treatments.map((treatment, index) => (
            <li key={treatment.id} className="border-t border-line last:border-b">
              <Reveal distance={10}>
                <Link
                  href={`/tratamentos/${treatment.slug}`}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-2 py-6 md:grid-cols-[3.5rem_1fr_auto] md:py-7"
                >
                  <span className="font-display text-lg text-clay-600 italic tabular">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-display text-[1.6rem] leading-tight text-ink transition-colors group-hover:text-pine-800 md:text-[2rem]">
                        {treatment.name}
                      </span>
                      <span className="text-sm text-ink-soft tabular">
                        {formatDuration(treatment.durationMinutes)}
                      </span>
                      {treatment.isUrgent ? (
                        <span className="rounded-full bg-clay-100 px-2.5 py-0.5 text-xs font-semibold text-clay-700">
                          No mesmo dia
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2 block max-w-xl text-[0.98rem] text-ink-soft">
                      {treatment.summary}
                    </span>
                  </span>
                  <span className="flex size-10 items-center justify-center self-center rounded-full border border-line text-pine-800 transition-all group-hover:border-pine-800 group-hover:bg-pine-800 group-hover:text-paper">
                    <ArrowUpRightIcon size={18} />
                    <span className="sr-only">Ver detalhes de {treatment.name}</span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
