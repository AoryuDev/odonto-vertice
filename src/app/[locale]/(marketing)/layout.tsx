import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site/footer'
import { SiteHeader } from '@/components/site/header'
import { MobileBookingBar } from '@/components/site/mobile-booking-bar'
import { MotionProvider } from '@/components/site/motion'
import { currentLocale } from '@/i18n/server'

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const locale = await currentLocale()
  return (
    <MotionProvider>
      <SiteHeader />
      <main id="conteudo">{children}</main>
      <SiteFooter locale={locale} />
      <MobileBookingBar />
    </MotionProvider>
  )
}
