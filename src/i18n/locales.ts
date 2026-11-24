import { z } from 'zod'
import { routing, type AppLocale } from './routing'

export const localeSchema = z.enum(routing.locales)

export const HTML_LANG: Record<AppLocale, string> = { pt: 'pt-BR', en: 'en' }

export const INTL_LOCALE: Record<AppLocale, string> = { pt: 'pt-BR', en: 'en-US' }

export const OPEN_GRAPH_LOCALE: Record<AppLocale, string> = { pt: 'pt_BR', en: 'en_US' }

export const LOCALE_NAMES: Record<AppLocale, string> = { pt: 'Português', en: 'English' }

export function isAppLocale(value: unknown): value is AppLocale {
  return localeSchema.safeParse(value).success
}
