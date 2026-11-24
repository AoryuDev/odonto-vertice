import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import * as rootParams from 'next/root-params'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'
import { loadMessages } from './messages'
import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => {
  const resolved = locale ?? (await rootParams.locale())
  if (!hasLocale(routing.locales, resolved)) notFound()

  return {
    locale: resolved,
    messages: await loadMessages(resolved),
    timeZone: CLINIC_TIME_ZONE,
    getMessageFallback: ({ namespace, key }) => `⟦${[namespace, key].filter(Boolean).join('.')}⟧`,
  }
})
