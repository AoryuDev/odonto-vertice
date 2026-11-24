import { describe, expect, it } from 'vitest'
import { buildIcs } from './ics'

const event = {
  uid: 'abc@odontovertice',
  start: new Date('2026-11-25T12:00:00Z'),
  end: new Date('2026-11-25T12:45:00Z'),
  summary: 'Limpeza, Odonto Vértice',
  description: 'Com Dra. Helena Prado; chegue 10 min antes',
  location: 'Avenida T-10, 1180 — Setor Bueno, Goiânia',
  url: 'https://example.com/agendamento/token',
}

describe('buildIcs', () => {
  it('produces a CRLF calendar with UTC timestamps and a reminder', () => {
    const ics = buildIcs(event, new Date('2026-11-20T10:00:00Z'))

    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true)
    expect(ics).toContain('DTSTART:20261125T120000Z\r\n')
    expect(ics).toContain('DTEND:20261125T124500Z\r\n')
    expect(ics).toContain('TRIGGER:-PT2H')
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })

  it('escapes commas, semicolons and line breaks', () => {
    expect(buildIcs(event)).toContain('DESCRIPTION:Com Dra. Helena Prado\; chegue 10 min antes')
    expect(buildIcs(event)).toContain('SUMMARY:Limpeza\\, Odonto Vértice')
  })

  it('folds lines longer than 75 octets', () => {
    const long = buildIcs({ ...event, description: 'x'.repeat(200) })
    const folded = long
      .split('\r\n')
      .filter((line) => line.startsWith('DESCRIPTION') || line.startsWith(' x'))

    expect(folded.length).toBeGreaterThan(1)
    expect(folded.every((line) => line.length <= 75)).toBe(true)
  })

  it('marks cancelled events', () => {
    expect(buildIcs({ ...event, cancelled: true })).toContain('STATUS:CANCELLED')
  })
})
