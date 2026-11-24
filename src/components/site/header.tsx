import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ButtonLink } from '@/components/ui/button'
import { PhoneIcon } from '@/components/ui/icons'
import { clinic } from '@/modules/catalog/clinic'
import { Logo } from './logo'
import { LocaleSwitcherSlot } from './locale-switcher-slot'
import { MobileNav } from './mobile-nav'
import { NAV_ITEMS } from './nav-items'

export async function SiteHeader() {
  const t = await getTranslations('header')
  const items = NAV_ITEMS.map((item) => ({ href: item.href, label: t(`nav.${item.key}`) }))

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/95 supports-[backdrop-filter]:bg-paper/85 supports-[backdrop-filter]:backdrop-blur-sm">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-pine-900 focus:px-4 focus:py-2 focus:text-paper"
      >
        {t('skipToContent')}
      </a>
      <div className="container-page relative flex h-16 items-center justify-between gap-6 md:h-20">
        <Logo />
        <nav aria-label={t('navLabel')} className="hidden xl:block">
          <ul className="flex items-center gap-7 text-[0.95rem] whitespace-nowrap text-ink-soft">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto hidden items-center gap-4 md:flex xl:ml-0 xl:gap-5">
          <LocaleSwitcherSlot />
          <a
            href={`tel:${clinic.phone.e164}`}
            className="hidden items-center gap-2 text-[0.95rem] whitespace-nowrap text-ink-soft hover:text-ink xl:inline-flex"
          >
            <PhoneIcon size={18} />
            <span className="tabular">{clinic.phone.display}</span>
          </a>
          <ButtonLink href="/agendar">{t('book')}</ButtonLink>
        </div>
        <MobileNav items={items} phone={clinic.phone.e164} />
      </div>
    </header>
  )
}
