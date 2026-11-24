import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/site/motion'
import { Eyebrow } from '@/components/ui/eyebrow'

const OTHERS = ['braces', 'implant'] as const

export async function TestimonialsSection() {
  const t = await getTranslations('home.testimonials')
  const featuredAuthor = t('featured.author')
  return (
    <section aria-labelledby="depoimentos-titulo" className="bg-pine-900 py-20 text-paper md:py-28">
      <div className="container-page">
        <Eyebrow tone="inverse">{t('eyebrow')}</Eyebrow>
        <h2 id="depoimentos-titulo" className="sr-only">
          {t('title')}
        </h2>
        <div className="mt-8 grid gap-12 md:grid-cols-12 md:gap-10">
          <figure className="md:col-span-7">
            <Reveal>
              <blockquote className="font-display text-[1.75rem] leading-[1.25] text-paper md:text-[2.5rem]">
                <span aria-hidden="true" className="mr-1 text-clay-200">
                  “
                </span>
                {t('featured.quote')}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-full bg-pine-700 font-display text-lg"
                >
                  {featuredAuthor.charAt(0)}
                </span>
                <span>
                  <span className="block font-medium">{featuredAuthor}</span>
                  <span className="block text-sm text-pine-300">{t('featured.context')}</span>
                </span>
              </figcaption>
            </Reveal>
          </figure>
          <div className="space-y-10 md:col-span-5 md:border-l md:border-pine-700 md:pl-10">
            {OTHERS.map((item, index) => (
              <Reveal key={item} delay={0.1 + index * 0.08}>
                <figure>
                  <blockquote className="text-lg leading-relaxed text-pine-100">
                    “{t(`${item}.quote`)}”
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-medium text-paper">{t(`${item}.author`)}</span>
                    <span className="text-pine-300"> · {t(`${item}.context`)}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
            <p className="text-xs text-pine-300">{t('disclaimer')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
