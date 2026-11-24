'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

const ITEMS = [
  { href: '/painel', label: 'Agenda' },
  { href: '/painel/bloqueios', label: 'Bloqueios' },
] as const

export function PanelNav() {
  const pathname = usePathname()
  return <PanelNavList pathname={pathname} />
}

export function PanelNavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Painel">
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
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
