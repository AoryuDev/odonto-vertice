import { Link } from '@/i18n/navigation'
import { Suspense, type ReactNode } from 'react'
import { PanelNav, PanelNavList } from '@/components/panel/panel-nav'
import { StaffCard } from '@/components/panel/staff-card'
import { LocaleSwitcherSlot } from '@/components/site/locale-switcher-slot'
import { LogoMark } from '@/components/ui/icons'

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-card px-4 py-3 lg:h-dvh lg:flex-col lg:items-stretch lg:justify-start lg:gap-8 lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
        <Link href="/painel" className="inline-flex items-center gap-2 text-pine-900">
          <LogoMark size={26} />
          <span className="font-display text-lg leading-none">
            Vértice <span className="text-sm text-ink-soft">painel</span>
          </span>
        </Link>
        <Suspense fallback={<PanelNavList pathname={null} />}>
          <PanelNav />
        </Suspense>
        <div className="lg:mt-auto">
          <div className="mb-4 hidden lg:block">
            <LocaleSwitcherSlot />
          </div>
          <Suspense fallback={<span className="block h-9 w-24 rounded-full bg-paper-deep" />}>
            <StaffCard />
          </Suspense>
          <Link
            href="/"
            className="mt-4 hidden text-sm text-ink-soft underline underline-offset-4 hover:text-ink lg:inline-block"
          >
            Ver site
          </Link>
        </div>
      </aside>
      <main id="conteudo" className="min-w-0 px-4 py-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  )
}
