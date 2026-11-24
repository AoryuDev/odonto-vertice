import { describe, expect, it } from 'vitest'
import { bookingHref, currentStep, parseBookingSearch } from './search-params'

describe('booking search params', () => {
  it('parses a complete selection', () => {
    const selection = parseBookingSearch({
      tratamento: 'limpeza',
      dentista: 'qualquer',
      data: '2026-11-25',
      horario: '2026-11-25T11:00:00.000Z',
    })

    expect(selection).toEqual({
      treatment: 'limpeza',
      dentist: 'qualquer',
      date: '2026-11-25',
      start: '2026-11-25T11:00:00.000Z',
    })
    expect(currentStep(selection)).toBe('details')
  })

  it('drops malformed values instead of failing the page', () => {
    const selection = parseBookingSearch({
      tratamento: '../etc',
      dentista: 'Robert"); DROP',
      data: '2026-02-30',
      horario: 'amanhã',
    })

    expect(selection).toEqual({
      treatment: undefined,
      dentist: undefined,
      date: undefined,
      start: undefined,
    })
    expect(currentStep(selection)).toBe('treatment')
  })

  it('takes the first value when a parameter is repeated', () => {
    expect(parseBookingSearch({ tratamento: ['limpeza', 'urgencia'] }).treatment).toBe('limpeza')
  })

  it('walks the steps in order', () => {
    expect(currentStep({ treatment: 'limpeza' })).toBe('dentist')
    expect(currentStep({ treatment: 'limpeza', dentist: 'helena-prado' })).toBe('slot')
  })

  it('builds stable URLs without empty parameters', () => {
    expect(bookingHref({})).toBe('/agendar')
    expect(bookingHref({ treatment: 'limpeza', dentist: 'qualquer' })).toBe(
      '/agendar?tratamento=limpeza&dentista=qualquer',
    )
  })
})
