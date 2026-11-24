import { Reveal } from '@/components/site/motion'
import { Eyebrow } from '@/components/ui/eyebrow'

const FEATURED = {
  quote:
    'Eu adiava a limpeza havia três anos, por medo. A Dra. Helena mostrou cada dente na tela antes de começar e foi a primeira vez que saí do dentista sem os ombros tensos.',
  author: 'Mariana S.',
  context: 'Limpeza e restaurações, desde 2022',
}

const OTHERS = [
  {
    quote:
      'Coloquei aparelho aos 34. O Dr. Rafael explicou o que ia mudar em cada manutenção e nunca esperei mais de dez minutos na recepção.',
    author: 'Thiago R.',
    context: 'Ortodontia',
  },
  {
    quote:
      'Achei que não poderia fazer implante por causa da diabetes. A Dra. Camila pediu exames, conversou com o meu endocrinologista e montou o plano com calma.',
    author: 'Sueli M.',
    context: 'Implante',
  },
] as const

export function TestimonialsSection() {
  return (
    <section aria-labelledby="depoimentos-titulo" className="bg-pine-900 py-20 text-paper md:py-28">
      <div className="container-page">
        <Eyebrow tone="inverse">Pacientes</Eyebrow>
        <h2 id="depoimentos-titulo" className="sr-only">
          Depoimentos de pacientes
        </h2>
        <div className="mt-8 grid gap-12 md:grid-cols-12 md:gap-10">
          <figure className="md:col-span-7">
            <Reveal>
              <blockquote className="font-display text-[1.75rem] leading-[1.25] text-paper md:text-[2.5rem]">
                <span aria-hidden="true" className="mr-1 text-clay-200">
                  “
                </span>
                {FEATURED.quote}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-full bg-pine-700 font-display text-lg"
                >
                  {FEATURED.author.charAt(0)}
                </span>
                <span>
                  <span className="block font-medium">{FEATURED.author}</span>
                  <span className="block text-sm text-pine-300">{FEATURED.context}</span>
                </span>
              </figcaption>
            </Reveal>
          </figure>
          <div className="space-y-10 md:col-span-5 md:border-l md:border-pine-700 md:pl-10">
            {OTHERS.map((item, index) => (
              <Reveal key={item.author} delay={0.1 + index * 0.08}>
                <figure>
                  <blockquote className="text-lg leading-relaxed text-pine-100">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-medium text-paper">{item.author}</span>
                    <span className="text-pine-300"> · {item.context}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
            <p className="text-xs text-pine-300">
              Depoimentos ilustrativos: a Odonto Vértice é uma clínica fictícia.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
