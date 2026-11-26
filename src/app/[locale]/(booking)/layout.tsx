import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site/footer'
import { LocaleSwitcherSlot } from '@/components/site/locale-switcher-slot'
import { Logo } from '@/components/site/logo'
import { MotionProvider } from '@/components/site/motion'
import { currentLocale } from '@/i18n/server'

export default async function BookingLayout({ children }: { children: ReactNode }) {
  const locale = await currentLocale()
  const t = await getTranslations({ locale, namespace: 'header' })
  return (
    <MotionProvider>
      <header className="border-b border-line bg-paper">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-pine-900 focus:px-4 focus:py-2 focus:text-paper"
        >
          {t('skipToContent')}
        </a>
        <div className="container-page flex h-16 items-center justify-between md:h-20">
          <Logo />
          <LocaleSwitcherSlot />
        </div>
      </header>
      <main id="conteudo" className="min-h-[70dvh]">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </MotionProvider>
  )
}
