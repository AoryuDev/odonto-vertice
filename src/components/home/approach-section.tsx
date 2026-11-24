import Image from 'next/image'
import { Reveal } from '@/components/site/motion'
import { Eyebrow } from '@/components/ui/eyebrow'
import { photos } from '@/content/photos'

const PRINCIPLES = [
  {
    title: 'Plano por escrito, sem decidir na cadeira',
    body: 'Depois da avaliação você leva para casa o diagnóstico, as etapas e o número estimado de sessões. Pode pensar, pesquisar e voltar quando quiser.',
  },
  {
    title: 'Agenda feita com a duração real',
    body: 'Uma restauração ocupa uma hora, uma manutenção de aparelho, meia. Por isso a sala de espera não lota e a sua consulta começa no horário.',
  },
  {
    title: 'Convênio conferido antes',
    body: 'Se você usa plano odontológico, a recepção confirma a cobertura e pede as autorizações necessárias antes do atendimento.',
  },
  {
    title: 'Instrumentos esterilizados e rastreados',
    body: 'Cada kit é embalado, identificado e aberto na sua frente. O registro da autoclave fica disponível para consulta na recepção.',
  },
] as const

export function ApproachSection() {
  return (
    <section id="como-trabalhamos" className="container-page py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10 lg:gap-16">
        <div className="relative md:col-span-5">
          <Reveal>
            <Image
              src={photos.consultation.src}
              alt={photos.consultation.alt}
              placeholder="blur"
              sizes="(min-width: 768px) 40vw, 100vw"
              className="aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover object-[35%_50%]"
            />
          </Reveal>
          <figure className="relative -mt-10 mr-6 ml-auto max-w-xs rounded-[1.25rem] bg-pine-900 p-5 text-paper md:absolute md:right-[-2.5rem] md:bottom-12 md:mt-0 md:mr-0">
            <blockquote className="font-display text-[1.3rem] leading-snug italic">
              “Antes de tocar no dente, a gente mostra na tela o que está vendo.”
            </blockquote>
            <figcaption className="mt-3 text-sm text-pine-200">Dra. Helena Prado</figcaption>
          </figure>
        </div>

        <div className="md:col-span-7 md:pt-6">
          <Eyebrow>Como trabalhamos</Eyebrow>
          <h2 className="mt-5 max-w-xl text-title text-ink">
            O que você pode esperar a partir da primeira consulta.
          </h2>
          <ol className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <li key={principle.title}>
                <Reveal delay={index * 0.06} distance={12}>
                  <span className="block font-display text-[2.6rem] leading-none text-clay-500 italic tabular">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-sans text-lg font-semibold tracking-normal text-ink">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-[0.98rem] text-ink-soft">{principle.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
