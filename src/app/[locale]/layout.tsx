import type { Metadata, Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import * as rootParams from 'next/root-params'
import type { ReactNode } from 'react'
import { HTML_LANG } from '@/i18n/locales'
import { routing } from '@/i18n/routing'
import { siteUrl } from '@/lib/site'
import { hanken, newsreader, newsreaderItalic } from '../fonts'
import '../globals.css'

const description =
  'Clínica odontológica no Setor Bueno, em Goiânia. Clínica geral, ortodontia e implantes, com atendimento particular e por convênio e agendamento online.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Odonto Vértice — Dentista no Setor Bueno, Goiânia',
    template: '%s · Odonto Vértice',
  },
  description,
  applicationName: 'Odonto Vértice',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Odonto Vértice',
    title: 'Odonto Vértice — Dentista no Setor Bueno, Goiânia',
    description,
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false, address: false, email: false },
}

export const viewport: Viewport = {
  themeColor: '#f6f1e8',
  colorScheme: 'light',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const CLIENT_NAMESPACES = ['localeSwitcher', 'mobileNav', 'errorPage'] as const

export default async function LocaleLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await rootParams.locale()
  if (!hasLocale(routing.locales, locale)) notFound()

  const messages = await getMessages()
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((namespace) => [namespace, messages[namespace]]),
  )

  return (
    <html
      lang={HTML_LANG[locale]}
      data-scroll-behavior="smooth"
      className={`${newsreader.variable} ${newsreaderItalic.variable} ${hanken.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
