import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/clients', () => ({}))

const { parsePeriod, toPeriodLiteral } = await import('./appointment.repository')

describe('tstzrange helpers', () => {
  it('parses the range literal returned by PostgREST', () => {
    const period = parsePeriod('["2026-11-25 12:00:00+00","2026-11-25 12:30:00+00")')

    expect(period.start.toISOString()).toBe('2026-11-25T12:00:00.000Z')
    expect(period.end.toISOString()).toBe('2026-11-25T12:30:00.000Z')
  })

  it('round-trips a half-open range literal', () => {
    const start = new Date('2026-11-25T12:00:00Z')
    const end = new Date('2026-11-25T12:45:00Z')

    expect(parsePeriod(toPeriodLiteral(start, end))).toEqual({ start, end })
  })

  it('rejects unexpected formats', () => {
    expect(() => parsePeriod('(,)')).toThrow('Unexpected period format')
  })
})
