import { describe, expect, it } from 'vitest'
import { pickTranslation, translationLocales } from './translations'

const rows = [
  { locale: 'pt', name: 'Limpeza' },
  { locale: 'en', name: 'Cleaning' },
]

describe('translations', () => {
  it('prefers the requested language', () => {
    expect(pickTranslation(rows, 'en')?.name).toBe('Cleaning')
    expect(pickTranslation(rows, 'pt')?.name).toBe('Limpeza')
  })

  it('falls back to Portuguese when a translation is missing', () => {
    expect(pickTranslation([{ locale: 'pt', name: 'Limpeza' }], 'en')?.name).toBe('Limpeza')
    expect(pickTranslation([], 'en')).toBeUndefined()
  })

  it('asks the database only for the requested language and the fallback', () => {
    expect(translationLocales('en')).toEqual(['en', 'pt'])
    expect(translationLocales('pt')).toEqual(['pt'])
  })
})
