import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Reveal } from '@/components/site/motion'
import { Eyebrow } from '@/components/ui/eyebrow'
import { photos } from '@/content/photos'

const PRINCIPLES = ['plan', 'schedule', 'insurance', 'sterilization'] as const

export async function ApproachSection() {
  const [t, tPhoto] = await Promise.all([
    getTranslations('home.approach'),
    getTranslations('photoAlt'),
  ])
  return (
    <section id="como-trabalhamos" className="container-page py-20 md:py-28">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10 lg:gap-16">
        <div className="relative md:col-span-5">
          <Reveal>
            <Image
              src={photos.consultation.src}
              alt={tPhoto(photos.consultation.altKey)}
              placeholder="blur"
              sizes="(min-width: 768px) 40vw, 100vw"
              className="aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover object-[35%_50%]"
            />
          </Reveal>
          <figure className="relative z-10 mx-auto -mt-12 max-w-[min(20rem,calc(100%-2.5rem))] rounded-[1.25rem] bg-pine-900 p-5 text-paper">
            <blockquote className="font-display text-[1.3rem] leading-snug italic">
              {t('quote')}
            </blockquote>
            <figcaption className="mt-3 text-sm text-pine-200">{t('quoteAuthor')}</figcaption>
          </figure>
        </div>

        <div className="md:col-span-7 md:pt-6">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h2 className="mt-5 max-w-xl text-title text-ink">{t('title')}</h2>
          <ol className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <li key={principle}>
                <Reveal delay={index * 0.06} distance={12}>
                  <span className="block font-display text-[2.6rem] leading-none text-clay-500 italic tabular">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-sans text-lg font-semibold tracking-normal text-ink">
                    {t(`principles.${principle}.title`)}
                  </h3>
                  <p className="mt-2 text-[0.98rem] text-ink-soft">
                    {t(`principles.${principle}.body`)}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
