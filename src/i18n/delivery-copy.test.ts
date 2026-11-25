import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'
import en from '../../messages/en.json'
import pt from '../../messages/pt.json'

const MESSAGES = { pt, en } as const
const LOCALES = ['pt', 'en'] as const
const EMAIL = 'ana@example.com'

function render(locale: (typeof LOCALES)[number], key: string, delivery: string) {
  const t = createTranslator({ locale, messages: MESSAGES[locale] })
  return t(key as never, { email: EMAIL, delivery } as never) as string
}

describe.each(LOCALES)('delivery-aware confirmations (%s)', (locale) => {
  const keys = [
    'manage.banners.booked.body',
    'manage.banners.rescheduled.body',
    'panel.appointment.flash.remarcada',
  ]

  it.each(keys)('%s claims nothing was sent when notices are not delivered', (key) => {
    const text = render(locale, key, 'none')
    expect(text).not.toMatch(/e-?mail|WhatsApp|enviad|sent|way/i)
    expect(text).not.toContain(EMAIL)
  })

  it.each(keys)('%s names the channel that delivered the notice', (key) => {
    expect(render(locale, key, 'email')).toMatch(/e-?mail|ana@example\.com/i)
    expect(render(locale, key, 'whatsapp')).toContain('WhatsApp')
  })

  it('shows the address the booking details went to', () => {
    expect(render(locale, 'manage.banners.booked.body', 'email')).toContain(EMAIL)
  })
})
