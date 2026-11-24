import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site/footer'
import { Logo } from '@/components/site/logo'
import { MotionProvider } from '@/components/site/motion'
import { PhoneIcon } from '@/components/ui/icons'
import { clinic } from '@/modules/catalog/clinic'

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <header className="border-b border-line bg-paper">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-pine-900 focus:px-4 focus:py-2 focus:text-paper"
        >
          Pular para o conteúdo
        </a>
        <div className="container-page flex h-16 items-center justify-between md:h-20">
          <Logo />
          <a
            href={`tel:${clinic.phone.e164}`}
            className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
          >
            <PhoneIcon size={18} />
            <span className="hidden sm:inline">Prefere ligar?</span>
            <span className="tabular">{clinic.phone.display}</span>
          </a>
        </div>
      </header>
      <main id="conteudo" className="min-h-[70dvh]">
        {children}
      </main>
      <SiteFooter />
    </MotionProvider>
  )
}
