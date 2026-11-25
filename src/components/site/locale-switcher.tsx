'use client'

import { useLocale, useTranslations } from 'next-intl'
import type { MouseEvent } from 'react'
import { HTML_LANG, LOCALE_NAMES } from '@/i18n/locales'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { routing, type AppLocale } from '@/i18n/routing'
import { cn } from '@/lib/cn'

export type LocaleSwitcherVariant = 'compact' | 'full' | 'inverse'

type Variant = LocaleSwitcherVariant

export function localeItemClass(variant: Variant, current: boolean): string {
  return cn(
    'inline-flex min-h-9 items-center rounded-full px-2.5 text-sm transition-colors',
    variant === 'full' && 'min-h-11 border px-4 text-[0.95rem]',
    variant === 'inverse'
      ? current
        ? 'font-semibold text-paper'
        : 'text-pine-300 hover:text-paper'
      : current
        ? cn('font-semibold text-ink', variant === 'full' && 'border-pine-800 bg-pine-100')
        : cn('text-ink-soft hover:text-ink', variant === 'full' && 'border-line-strong'),
  )
}

export function LocaleItemLabel({ variant, locale }: { variant: Variant; locale: AppLocale }) {
  return variant === 'full' ? (
    LOCALE_NAMES[locale]
  ) : (
    <>
      <span aria-hidden="true">{locale.toUpperCase()}</span>
      <span className="sr-only">{LOCALE_NAMES[locale]}</span>
    </>
  )
}

export function LocaleSwitcherFallback({ variant = 'compact' }: { variant?: Variant }) {
  const t = useTranslations('localeSwitcher')
  const active = useLocale()
  return (
    <nav aria-label={t('label')}>
      <ul className={cn('flex items-center', variant === 'full' ? 'gap-2' : 'gap-0.5')}>
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href="/"
              locale={locale}
              lang={HTML_LANG[locale]}
              hrefLang={HTML_LANG[locale]}
              aria-current={locale === active ? 'true' : undefined}
              className={localeItemClass(variant, locale === active)}
            >
              <LocaleItemLabel variant={variant} locale={locale} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function LocaleSwitcher({ variant = 'compact' }: { variant?: Variant }) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('localeSwitcher')
  const active = useLocale()

  const keepQuery = (locale: AppLocale) => (event: MouseEvent<HTMLAnchorElement>) => {
    const { search } = window.location
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    if (!search || modified || event.button !== 0) return
    event.preventDefault()
    router.push(`${pathname}${search}`, { locale, scroll: false })
  }

  return (
    <nav aria-label={t('label')}>
      <ul className={cn('flex items-center', variant === 'full' ? 'gap-2' : 'gap-0.5')}>
        {routing.locales.map((locale) => {
          const current = locale === active
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                lang={HTML_LANG[locale]}
                hrefLang={HTML_LANG[locale]}
                aria-current={current ? 'true' : undefined}
                scroll={false}
                onClick={current ? undefined : keepQuery(locale)}
                className={localeItemClass(variant, current)}
              >
                <LocaleItemLabel variant={variant} locale={locale} />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
