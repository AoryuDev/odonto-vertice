import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { ButtonLink } from '@/components/ui/button'
import { photos } from '@/content/photos'

export async function ClosingCta() {
  const [t, tPhoto] = await Promise.all([
    getTranslations('home.closing'),
    getTranslations('photoAlt'),
  ])
  return (
    <section className="container-page py-16 md:py-24">
      <div className="relative grid overflow-hidden rounded-[2rem] bg-pine-800 text-paper md:grid-cols-12">
        <div className="relative z-10 p-8 md:col-span-7 md:p-14">
          <h2 className="text-title">{t('title')}</h2>
          <p className="mt-5 max-w-lg text-pine-100">{t('body')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/agendar" variant="inverse" size="lg">
              {t('cta')}
            </ButtonLink>
          </div>
        </div>
        <div className="relative hidden md:col-span-5 md:block">
          <Image
            src={photos.clinicRoom.src}
            alt={tPhoto(photos.clinicRoom.altKey)}
            placeholder="blur"
            sizes="32vw"
            className="absolute inset-0 size-full object-cover opacity-90"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-pine-800 to-transparent"
          />
        </div>
      </div>
    </section>
  )
}
