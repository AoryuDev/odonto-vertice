import 'server-only'
import en from '../../messages/en.json'
import pt from '../../messages/pt.json'
import type { Messages } from './messages'
import type { AppLocale } from './routing'

export const SERVER_MESSAGES: Record<AppLocale, Messages> = { pt, en }
