'use client'

import { usePathname } from 'next/navigation'
import { use } from 'react'
import { routing, type AppLocale } from '@/i18n/routing'
import type { GlobalErrorText } from '@/i18n/global-error-text'
import './globals.css'

const texts = new Map<AppLocale, Promise<GlobalErrorText>>()

function localeOf(pathname: string | null): AppLocale {
  const segment = pathname?.split('/')[1]
  return routing.locales.find((locale) => locale === segment) ?? routing.defaultLocale
}

function textFor(locale: AppLocale): Promise<GlobalErrorText> {
  const cached = texts.get(locale)
  if (cached) return cached
  const pending = import('@/i18n/global-error-text').then((module) =>
    module.globalErrorText(locale),
  )
  texts.set(locale, pending)
  return pending
}

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const text = use(textFor(localeOf(usePathname())))
  return (
    <html lang={text.lang}>
      <body>
        <main className="container-page flex min-h-dvh flex-col justify-center py-16">
          <h1 className="text-title text-ink">{text.title}</h1>
          <p className="mt-5 max-w-xl text-ink-soft">{text.body}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 h-11 w-fit rounded-full bg-pine-800 px-5 text-paper"
          >
            {text.retry}
          </button>
        </main>
      </body>
    </html>
  )
}
