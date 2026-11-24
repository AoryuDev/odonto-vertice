import type messages from '../../messages/pt.json'
import type { AppLocale } from './routing'

export type Messages = typeof messages

export async function loadMessages(locale: AppLocale): Promise<Messages> {
  return (await import(`../../messages/${locale}.json`)).default as Messages
}
