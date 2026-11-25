import { routing, type AppLocale } from './routing'

export function translationLocales(locale: AppLocale): AppLocale[] {
  return [...new Set([locale, routing.defaultLocale])]
}

export function pickTranslation<T extends { readonly locale: string }>(
  translations: readonly T[],
  locale: AppLocale,
): T | undefined {
  return (
    translations.find((translation) => translation.locale === locale) ??
    translations.find((translation) => translation.locale === routing.defaultLocale)
  )
}
