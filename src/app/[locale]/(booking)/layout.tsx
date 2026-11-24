import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site/footer'
import { LocaleSwitcherSlot } from '@/components/site/locale-switcher-slot'
import { Logo } from '@/components/site/logo'
import { MotionProvider } from '@/components/site/motion'
import { PhoneIcon } from '@/components/ui/icons'
import { currentLocale } from '@/i18n/server'
import { clinic } from '@/modules/catalog/clinic'

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
          <div className="flex items-center gap-3 sm:gap-5">
            <LocaleSwitcherSlot />
            <a
              href={`tel:${clinic.phone.e164}`}
              className="-mr-2.5 inline-flex size-11 items-center justify-center gap-2 text-sm whitespace-nowrap text-ink-soft hover:text-ink sm:mr-0 sm:size-auto"
            >
              <PhoneIcon size={18} />
              <span className="hidden sm:inline">{t('preferCall')}</span>
              <span className="sr-only tabular sm:not-sr-only">{clinic.phone.display}</span>
            </a>
          </div>
        </div>
      </header>
      <main id="conteudo" className="min-h-[70dvh]">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </MotionProvider>
  )
}
