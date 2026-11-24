'use client'

import { useTranslations } from 'next-intl'
import { Button, ButtonLink } from '@/components/ui/button'
import { clinic } from '@/modules/catalog/clinic'

export default function MarketingError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('errorPage')
  return (
    <section className="container-page py-24">
      <h1 className="text-title text-ink">{t('title')}</h1>
      <p className="mt-5 max-w-xl text-ink-soft">{t('body', { phone: clinic.phone.display })}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>{t('retry')}</Button>
        <ButtonLink href="/" variant="secondary">
          {t('home')}
        </ButtonLink>
      </div>
    </section>
  )
}
