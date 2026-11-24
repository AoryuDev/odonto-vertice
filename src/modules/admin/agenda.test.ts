import { describe, expect, it } from 'vitest'
import { parseLocalDate, parseLocalTime } from '@/modules/schedule/domain/clinic-time'
import {
  agendaStats,
  dayWindow,
  groupByDate,
  isVisible,
  offHoursBands,
  placeInWindow,
  workWeek,
  type AgendaEntry,
} from './agenda'

const TZ = 'America/Sao_Paulo'
const DATE = parseLocalDate('2026-11-25')
const WINDOW = dayWindow(DATE, parseLocalTime('08:00'), parseLocalTime('18:00'), TZ)

const at = (time: string) => new Date(`2026-11-25T${time}:00-03:00`)

describe('placeInWindow', () => {
  it('converts an interval into percentages of the visible window', () => {
    expect(placeInWindow({ start: at('13:00'), end: at('14:00') }, WINDOW)).toEqual({
      topPercent: 50,
      heightPercent: 10,
    })
  })

  it('clips intervals that start before or end after the window', () => {
    expect(placeInWindow({ start: at('07:00'), end: at('09:00') }, WINDOW)).toEqual({
      topPercent: 0,
      heightPercent: 10,
    })
  })

  it('returns null for intervals outside the window', () => {
    expect(placeInWindow({ start: at('18:00'), end: at('19:00') }, WINDOW)).toBeNull()
  })
})

describe('offHoursBands', () => {
  const schedule = {
    dentistId: 'd',
    weekday: 3,
    startsAt: parseLocalTime('09:00'),
    endsAt: parseLocalTime('17:00'),
    lunch: { startsAt: parseLocalTime('12:00'), endsAt: parseLocalTime('13:00') },
  }

  it('shades before opening, after closing and during lunch', () => {
    expect(offHoursBands(schedule, DATE, WINDOW, TZ)).toEqual([
      { topPercent: 0, heightPercent: 10 },
      { topPercent: 90, heightPercent: 10 },
      { topPercent: 40, heightPercent: 10 },
    ])
  })

  it('shades the whole column when the dentist does not work that day', () => {
    expect(offHoursBands(undefined, DATE, WINDOW, TZ)).toEqual([
      { topPercent: 0, heightPercent: 100 },
    ])
  })
})

describe('workWeek', () => {
  it('returns Monday to Saturday for any day of the week', () => {
    expect(workWeek(parseLocalDate('2026-11-29'))).toEqual([
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
      '2026-11-26',
      '2026-11-27',
      '2026-11-28',
    ])
    expect(workWeek(parseLocalDate('2026-11-23'))[0]).toBe('2026-11-23')
  })
})

describe('agenda helpers', () => {
  const entries: AgendaEntry[] = [
    {
      kind: 'appointment',
      id: '1',
      dentistId: 'd',
      start: at('10:00'),
      end: at('10:30'),
      status: 'cancelled',
      patientName: 'A',
      treatmentName: 'Avaliação',
      paymentMethod: 'private',
      insuranceProvider: null,
    },
    {
      kind: 'appointment',
      id: '2',
      dentistId: 'd',
      start: at('09:00'),
      end: at('09:30'),
      status: 'scheduled',
      patientName: 'B',
      treatmentName: 'Limpeza',
      paymentMethod: 'insurance',
      insuranceProvider: 'Plano',
    },
    {
      kind: 'block',
      id: '3',
      dentistId: 'd',
      start: new Date('2026-11-26T14:00:00-03:00'),
      end: new Date('2026-11-26T15:00:00-03:00'),
      reason: 'Curso',
    },
  ]

  it('counts appointments by status and ignores blocks', () => {
    expect(agendaStats(entries)).toEqual({ scheduled: 1, completed: 0, no_show: 0, cancelled: 1 })
  })

  it('groups entries by clinic date in chronological order', () => {
    const groups = groupByDate(entries, TZ)

    expect([...groups.keys()]).toEqual(['2026-11-25', '2026-11-26'])
    expect(groups.get('2026-11-25')?.map((entry) => entry.id)).toEqual(['2', '1'])
  })

  it('hides cancelled appointments unless asked', () => {
    expect(entries.filter((entry) => isVisible(entry, false)).map((entry) => entry.id)).toEqual([
      '2',
      '3',
    ])
    expect(entries.filter((entry) => isVisible(entry, true))).toHaveLength(3)
  })
})
