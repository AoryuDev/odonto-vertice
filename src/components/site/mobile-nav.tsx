'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Suspense, useEffect, useId, useRef, useState } from 'react'
import { CloseIcon, MenuIcon } from '@/components/ui/icons'
import { LocaleSwitcher, LocaleSwitcherFallback } from './locale-switcher'
import type { NavItem } from './nav-items'

export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const t = useTranslations('mobileNav')
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const close = () => setOpen(false)

  return (
    <div className="xl:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-ink"
      >
        {open ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        <span className="sr-only">{open ? t('close') : t('open')}</span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-[0_24px_40px_-24px_rgba(27,40,35,0.25)]"
      >
        <nav aria-label={t('label')} className="container-page py-4">
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex items-center justify-between py-3.5 font-display text-2xl text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-line pt-4">
            <Suspense fallback={<LocaleSwitcherFallback variant="full" />}>
              <LocaleSwitcher variant="full" />
            </Suspense>
          </div>
        </nav>
      </div>
    </div>
  )
}
