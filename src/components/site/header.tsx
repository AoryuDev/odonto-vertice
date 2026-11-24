import Link from 'next/link'
import { ButtonLink } from '@/components/ui/button'
import { PhoneIcon } from '@/components/ui/icons'
import { clinic } from '@/modules/catalog/clinic'
import { Logo } from './logo'
import { MobileNav } from './mobile-nav'
import { NAV_ITEMS } from './nav-items'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 supports-[backdrop-filter]:bg-paper/85 supports-[backdrop-filter]:backdrop-blur-sm">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-pine-900 focus:px-4 focus:py-2 focus:text-paper"
      >
        Pular para o conteúdo
      </a>
      <div className="container-page relative flex h-16 items-center justify-between gap-6 md:h-20">
        <Logo />
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[0.95rem] text-ink-soft">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <a
            href={`tel:${clinic.phone.e164}`}
            className="hidden items-center gap-2 text-[0.95rem] text-ink-soft hover:text-ink lg:inline-flex"
          >
            <PhoneIcon size={18} />
            <span className="tabular">{clinic.phone.display}</span>
          </a>
          <ButtonLink href="/agendar">Agendar consulta</ButtonLink>
        </div>
        <MobileNav items={NAV_ITEMS} phone={clinic.phone.e164} />
      </div>
    </header>
  )
}
