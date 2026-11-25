import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'
import { HTML_LANG, OPEN_GRAPH_LOCALE } from './locales'
import { getPathname } from './navigation'
import { routing, type AppLocale } from './routing'

export function localizedPath(href: string, locale: AppLocale): string {
  return getPathname({ href, locale }).replace(/^(\/[^/#?]+)\/(?=[#?])/, '$1')
}

export function localizedUrl(href: string, locale: AppLocale): string {
  return absoluteUrl(localizedPath(href, locale))
}

export function languageAlternates(href: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [HTML_LANG[locale], localizedPath(href, locale)]),
    ),
    'x-default': localizedPath(href, routing.defaultLocale),
  }
}

export function localizedAlternates(href: string, locale: AppLocale): Metadata['alternates'] {
  return { canonical: localizedPath(href, locale), languages: languageAlternates(href) }
}

export function openGraphLocales(locale: AppLocale) {
  return {
    locale: OPEN_GRAPH_LOCALE[locale],
    alternateLocale: routing.locales
      .filter((candidate) => candidate !== locale)
      .map((candidate) => OPEN_GRAPH_LOCALE[candidate]),
  }
}
