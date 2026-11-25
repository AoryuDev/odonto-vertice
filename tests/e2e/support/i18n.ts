import { expect, type Page } from '@playwright/test'
import { createTranslator } from 'next-intl'
import en from '../../../messages/en.json'
import pt from '../../../messages/pt.json'

export const MESSAGES = { pt, en } as const

export type Locale = keyof typeof MESSAGES

export const LOCALES = ['pt', 'en'] as const satisfies readonly Locale[]

export const CATALOG = {
  pt: {
    evaluation: 'Avaliação',
    bracesAdjustment: 'Manutenção de aparelho',
    helena: 'Dra. Helena Prado',
    rafael: 'Dr. Rafael Tavares',
    camila: 'Dra. Camila Arantes',
    leadFullTitle: 'Dra. Helena Prado Sato',
    tuesday: 'Terça-feira',
    thirtyMinutes: '30 min',
  },
  en: {
    evaluation: 'Dental exam',
    bracesAdjustment: 'Braces adjustment',
    helena: 'Dr. Helena Prado',
    rafael: 'Dr. Rafael Tavares',
    camila: 'Dr. Camila Arantes',
    leadFullTitle: 'Dr. Helena Prado Sato',
    tuesday: 'Tuesday',
    thirtyMinutes: '30 min',
  },
} as const satisfies Record<Locale, Record<string, string>>

export function localized(locale: Locale, path = '/'): string {
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

export function plain(message: string): string {
  return message.replace(/<\/?\w+>/g, '')
}

export function format(message: string, values: Record<string, string | number>): string {
  return plain(message).replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))
}

export function translate(
  locale: Locale,
  key: string,
  values: Record<string, string | number> = {},
): string {
  const t = createTranslator({ locale, messages: MESSAGES[locale] })
  return t(key as never, values as never) as string
}

const PORTUGUESE_ONLY =
  /\b(você|horários?|consultas?|agendar|agendamento|não|seus dados|etapa|livres?|amanhã|hoje|remarcar|cancelar|convênio|particular|dentista disponível|segunda|terça|quarta|quinta|sexta|sábado|domingo|avaliação|limpeza|restauração|clareamento|urgência|dra\.)\b/i

const ALLOWED =
  /Odonto Vértice|Vértice|Goiânia|Setor Bueno|Vaca Brava|Avenida T-10|sala 704|Português|LGPD|açaí|CEP \d|Brasília|wocintechchat\.com/g

export async function untranslatedText(page: Page): Promise<string[]> {
  const texts = await page.evaluate(() => {
    const visible = (element: Element) => element.checkVisibility()
    const attributes = [...document.querySelectorAll('[aria-label],[title],[placeholder],[alt]')]
      .filter(visible)
      .flatMap((element) =>
        ['aria-label', 'title', 'placeholder', 'alt'].map((name) => element.getAttribute(name)),
      )
    return [document.title, ...document.body.innerText.split('\n'), ...attributes]
      .filter((text): text is string => Boolean(text?.trim()))
      .map((text) => text.trim())
  })
  return [
    ...new Set(
      texts.filter((text) => text.includes('⟦') || PORTUGUESE_ONLY.test(text.replace(ALLOWED, ''))),
    ),
  ]
}

export async function expectFullyTranslated(page: Page) {
  await page.waitForLoadState('load')
  await expect.poll(() => untranslatedText(page)).toEqual([])
}
