import { describe, expect, it } from 'vitest'
import {
  addDays,
  isLocalDate,
  parseLocalDate,
  parseLocalTime,
  toInstant,
  toLocalDate,
  toLocalTime,
  weekdayOf,
} from './clinic-time'

describe('clinic time helpers', () => {
  it('accepts real calendar dates only', () => {
    expect(isLocalDate('2028-02-29')).toBe(true)
    expect(isLocalDate('2026-02-29')).toBe(false)
    expect(isLocalDate('2026-13-01')).toBe(false)
    expect(isLocalDate('26-11-25')).toBe(false)
  })

  it('normalizes times coming from Postgres', () => {
    expect(parseLocalTime('08:30:00')).toBe('08:30')
    expect(() => parseLocalTime('24:00')).toThrow(RangeError)
  })

  it('adds days across month and year boundaries', () => {
    expect(addDays(parseLocalDate('2026-12-30'), 3)).toBe('2027-01-02')
    expect(addDays(parseLocalDate('2026-03-01'), -1)).toBe('2026-02-28')
  })

  it('computes the weekday from the calendar date alone', () => {
    expect(weekdayOf(parseLocalDate('2026-11-24'))).toBe(2)
    expect(weekdayOf(parseLocalDate('2026-11-29'))).toBe(0)
  })

  it('converts clinic wall-clock time to an instant with the São Paulo offset', () => {
    const instant = toInstant(
      parseLocalDate('2026-11-25'),
      parseLocalTime('08:00'),
      'America/Sao_Paulo',
    )

    expect(instant.toISOString()).toBe('2026-11-25T11:00:00.000Z')
  })

  it('reads the clinic calendar date and time from an instant', () => {
    const lateNight = new Date('2026-11-25T02:30:00Z')

    expect(toLocalDate(lateNight, 'America/Sao_Paulo')).toBe('2026-11-24')
    expect(toLocalTime(lateNight, 'America/Sao_Paulo')).toBe('23:30')
  })
})
