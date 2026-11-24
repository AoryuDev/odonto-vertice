import { createTranslator } from 'next-intl'
import { clinic } from '@/modules/catalog/clinic'
import { HTML_LANG } from './locales'
import { loadMessages } from './messages'
import type { AppLocale } from './routing'

export type GlobalErrorText = {
  readonly lang: string
  readonly title: string
  readonly body: string
  readonly retry: string
}

export async function globalErrorText(locale: AppLocale): Promise<GlobalErrorText> {
  const messages = await loadMessages(locale)
  const t = createTranslator({ locale, messages, namespace: 'globalError' })
  return {
    lang: HTML_LANG[locale],
    title: t('title'),
    body: t('body', { phone: clinic.phone.display }),
    retry: t('retry'),
  }
}
