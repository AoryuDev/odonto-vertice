import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Eyebrow } from '@/components/ui/eyebrow'
import { uniquePhotoCredits } from '@/content/photos'
import { currentLocale } from '@/i18n/server'
import { localizedAlternates } from '@/i18n/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale()
  const t = await getTranslations({ locale, namespace: 'seo' })
  return {
    title: t('creditsTitle'),
    description: t('creditsDescription'),
    alternates: localizedAlternates('/creditos', locale),
    robots: { index: false, follow: true },
  }
}

export default async function CreditsPage() {
  const [t, tPhoto] = await Promise.all([getTranslations('credits'), getTranslations('photoAlt')])
  const credits = uniquePhotoCredits()
  return (
    <section className="container-page py-14 md:py-20">
      <Eyebrow>{t('eyebrow')}</Eyebrow>
      <h1 className="mt-5 text-title text-ink">{t('title')}</h1>
      <p className="mt-5 max-w-2xl text-ink-soft">{t('body')}</p>
      <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {credits.map((photo) => (
          <li key={photo.credit.url}>
            <Image
              src={photo.src}
              alt={tPhoto(photo.altKey)}
              placeholder="blur"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="aspect-[4/3] w-full rounded-[var(--radius-soft)] object-cover"
            />
            <p className="mt-3 text-sm text-ink-soft">
              {t.rich('photoBy', {
                name: photo.credit.name,
                link: (chunks) => (
                  <a
                    href={photo.credit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink underline underline-offset-4"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
