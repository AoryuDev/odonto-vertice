import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/site/logo'
import { ButtonLink } from '@/components/ui/button'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound')
  return { title: t('metaTitle') }
}

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <main className="container-page flex min-h-dvh flex-col justify-center py-16">
      <Logo />
      <p className="mt-16 text-sm font-semibold tracking-[0.14em] text-clay-600 uppercase">
        {t('eyebrow')}
      </p>
      <h1 className="mt-4 max-w-2xl text-title text-ink">{t('title')}</h1>
      <p className="mt-5 max-w-xl text-ink-soft">{t('body')}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">{t('home')}</ButtonLink>
        <ButtonLink href="/agendar" variant="secondary">
          {t('book')}
        </ButtonLink>
      </div>
    </main>
  )
}
