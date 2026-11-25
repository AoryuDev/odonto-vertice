import { describe, expect, it } from 'vitest'
import { languageAlternates, localizedAlternates, localizedPath, openGraphLocales } from './seo'

describe('seo helpers', () => {
  it('points each language at its own URL and x-default at Portuguese', () => {
    expect(languageAlternates('/tratamentos/limpeza')).toEqual({
      'pt-BR': '/pt/tratamentos/limpeza',
      en: '/en/tratamentos/limpeza',
      'x-default': '/pt/tratamentos/limpeza',
    })
  })

  it('uses the current language for the canonical URL', () => {
    expect(localizedAlternates('/', 'en')?.canonical).toBe('/en')
    expect(localizedAlternates('/agendar', 'pt')?.canonical).toBe('/pt/agendar')
  })

  it('links home sections without a trailing slash before the hash', () => {
    expect(localizedPath('/#tratamentos', 'pt')).toBe('/pt#tratamentos')
    expect(localizedPath('/agendar', 'en')).toBe('/en/agendar')
  })

  it('lists the other languages as Open Graph alternates', () => {
    expect(openGraphLocales('pt')).toEqual({ locale: 'pt_BR', alternateLocale: ['en_US'] })
    expect(openGraphLocales('en')).toEqual({ locale: 'en_US', alternateLocale: ['pt_BR'] })
  })
})
