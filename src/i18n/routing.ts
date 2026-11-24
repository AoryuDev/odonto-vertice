import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'always',
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
})

export type AppLocale = (typeof routing.locales)[number]
