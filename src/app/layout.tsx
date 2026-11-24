import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { siteUrl } from '@/lib/site'
import { hanken, newsreader } from './fonts'
import './globals.css'

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
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Odonto Vértice',
    title: 'Odonto Vértice — Dentista no Setor Bueno, Goiânia',
    description,
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false, address: false, email: false },
}

export const viewport: Viewport = {
  themeColor: '#f6f1e8',
  colorScheme: 'light',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${newsreader.variable} ${hanken.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
