import { describe, expect, it } from 'vitest'
import {
  bookingHref,
  isDentistParam,
  isTreatmentParam,
  parseDateParam,
  parseStartParam,
} from './booking-routes'

describe('booking routes', () => {
  it('maps each step to a readable path', () => {
    expect(bookingHref({})).toBe('/agendar')
    expect(bookingHref({ treatment: 'limpeza' })).toBe('/agendar/limpeza')
    expect(bookingHref({ treatment: 'limpeza', dentist: 'qualquer' })).toBe(
      '/agendar/limpeza/qualquer',
    )
    expect(
      bookingHref({ treatment: 'limpeza', dentist: 'helena-prado', date: '2026-11-25' as never }),
    ).toBe('/agendar/limpeza/helena-prado?data=2026-11-25')
    expect(
      bookingHref({
        treatment: 'limpeza',
        dentist: 'helena-prado',
        start: '2026-11-25T11:00:00.000Z',
      }),
    ).toBe('/agendar/limpeza/helena-prado/dados?horario=2026-11-25T11%3A00%3A00.000Z')
  })

  it('accepts only slug-shaped path segments', () => {
    expect(isTreatmentParam('avaliacao-de-implante')).toBe(true)
    expect(isTreatmentParam('../etc')).toBe(false)
    expect(isDentistParam('qualquer')).toBe(true)
    expect(isDentistParam('Robert"); DROP')).toBe(false)
  })

  it('drops malformed dates and instants instead of failing the page', () => {
    expect(parseDateParam('2026-02-30')).toBeUndefined()
    expect(parseDateParam(['2026-11-25', '2026-11-26'])).toBe('2026-11-25')
    expect(parseStartParam('amanhã')).toBeUndefined()
    expect(parseStartParam('2026-11-25T11:00:00.000Z')).toBe('2026-11-25T11:00:00.000Z')
  })
})
