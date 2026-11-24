import 'server-only'
import { getLocale } from 'next-intl/server'
import { localeSchema } from './locales'
import { routing, type AppLocale } from './routing'

export async function currentLocale(): Promise<AppLocale> {
  return getLocale()
}

export function localeFrom(value: unknown): AppLocale {
  return localeSchema.catch(routing.defaultLocale).parse(value)
}

export function formLocale(formData: FormData): AppLocale {
  return localeFrom(formData.get('locale'))
}
