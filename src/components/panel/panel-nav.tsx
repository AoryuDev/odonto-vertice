'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

const ITEMS = [
  { href: '/painel', key: 'agenda' },
  { href: '/painel/bloqueios', key: 'blocks' },
] as const

export function PanelNav() {
  const pathname = usePathname()
  return <PanelNavList pathname={pathname} />
}

export function PanelNavList({ pathname }: { pathname: string | null }) {
  const t = useTranslations('panel.layout')
  return (
    <nav aria-label={t('navLabel')}>
      <ul className="flex gap-1 lg:flex-col">
        {ITEMS.map((item) => {
          const current = pathname ?? ''
          const active =
            item.href === '/painel'
              ? current === '/painel' || current.startsWith('/painel/consultas')
              : current.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'block rounded-full px-4 py-2 text-[0.95rem] transition-colors lg:rounded-[0.8rem]',
                  active
                    ? 'bg-pine-800 text-paper'
                    : 'text-ink-soft hover:bg-paper-deep hover:text-ink',
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
