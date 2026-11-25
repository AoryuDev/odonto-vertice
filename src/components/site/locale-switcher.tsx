'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { HTML_LANG, LOCALE_NAMES } from '@/i18n/locales'
import { Link, usePathname } from '@/i18n/navigation'
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

export function LocaleSwitcher({ variant = 'compact' }: { variant?: Variant }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = Object.fromEntries(searchParams.entries())
  return <LocaleLinks variant={variant} href={{ pathname, query }} />
}

export function LocaleSwitcherFallback({ variant = 'compact' }: { variant?: Variant }) {
  return <LocaleLinks variant={variant} href="/" />
}

function LocaleLinks({
  variant,
  href,
}: {
  variant: Variant
  href: string | { pathname: string; query: Record<string, string> }
}) {
  const t = useTranslations('localeSwitcher')
  const active = useLocale()

  return (
    <nav aria-label={t('label')}>
      <ul className={cn('flex items-center', variant === 'full' ? 'gap-2' : 'gap-0.5')}>
        {routing.locales.map((locale) => {
          const current = locale === active
          return (
            <li key={locale}>
              <Link
                href={href}
                locale={locale}
                lang={HTML_LANG[locale]}
                hrefLang={HTML_LANG[locale]}
                aria-current={current ? 'true' : undefined}
                scroll={false}
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
