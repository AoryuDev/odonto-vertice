import type { Metadata, Viewport } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import * as rootParams from 'next/root-params'
import type { ReactNode } from 'react'
import { ClientMessages } from '@/i18n/client-messages'
import { HTML_LANG } from '@/i18n/locales'
import { routing } from '@/i18n/routing'
import { siteUrl } from '@/lib/site'
import { hanken, newsreader, newsreaderItalic } from '../fonts'
import '../globals.css'
import { openGraphLocales } from '@/i18n/seo'
import { clinic } from '@/modules/catalog/clinic'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')
  const locale = await rootParams.locale()
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t('siteTitle'), template: t('titleTemplate') },
    description: t('description'),
    applicationName: clinic.name,
    openGraph: {
      type: 'website',
      siteName: clinic.name,
      title: t('siteTitle'),
      description: t('description'),
      ...openGraphLocales(resolved),
    },
    twitter: { card: 'summary_large_image' },
    formatDetection: { telephone: false, address: false, email: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#f6f1e8',
  colorScheme: 'light',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const CLIENT_NAMESPACES = ['localeSwitcher', 'mobileNav', 'errorPage', 'field'] as const

export default async function LocaleLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await rootParams.locale()
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html
      lang={HTML_LANG[locale]}
      data-scroll-behavior="smooth"
      className={`${newsreader.variable} ${newsreaderItalic.variable} ${hanken.variable}`}
    >
      <body>
        <ClientMessages namespaces={CLIENT_NAMESPACES}>{children}</ClientMessages>
      </body>
    </html>
  )
}
