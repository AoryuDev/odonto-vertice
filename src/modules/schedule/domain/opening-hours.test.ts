import { describe, expect, it } from 'vitest'
import type { WeeklySchedule } from './availability'
import { parseLocalTime } from './clinic-time'
import { clinicOpeningHours, describeWeekdays, groupOpeningHours } from './opening-hours'

function schedule(dentistId: string, weekday: number, start: string, end: string): WeeklySchedule {
  return {
    dentistId,
    weekday,
    startsAt: parseLocalTime(start),
    endsAt: parseLocalTime(end),
    lunch: null,
  }
}

describe('clinic opening hours', () => {
  const schedules = [
    schedule('a', 1, '08:00', '18:00'),
    schedule('b', 1, '09:00', '18:00'),
    schedule('a', 2, '08:00', '18:00'),
    schedule('b', 2, '08:30', '18:30'),
    schedule('a', 3, '08:00', '18:00'),
    schedule('a', 6, '08:00', '12:00'),
  ]

  it('takes the earliest opening and the latest closing of each weekday, Monday first', () => {
    expect(clinicOpeningHours(schedules)).toEqual([
      { weekday: 1, opensAt: '08:00', closesAt: '18:00' },
      { weekday: 2, opensAt: '08:00', closesAt: '18:30' },
      { weekday: 3, opensAt: '08:00', closesAt: '18:00' },
      { weekday: 6, opensAt: '08:00', closesAt: '12:00' },
    ])
  })

  it('groups consecutive weekdays with identical hours', () => {
    const groups = groupOpeningHours(clinicOpeningHours(schedules))

    expect(groups.map((group) => describeWeekdays(group.weekdays))).toEqual([
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Sábado',
    ])
    expect(
      groupOpeningHours([
        { weekday: 1, opensAt: parseLocalTime('08:00'), closesAt: parseLocalTime('18:00') },
        { weekday: 2, opensAt: parseLocalTime('08:00'), closesAt: parseLocalTime('18:00') },
        { weekday: 3, opensAt: parseLocalTime('08:00'), closesAt: parseLocalTime('18:00') },
      ]).map((group) => describeWeekdays(group.weekdays)),
    ).toEqual(['Seg a Qua'])
  })
})

describe('summarizeWeekHours', () => {
  it('merges weekdays into one line and keeps Saturday apart', async () => {
    const { summarizeWeekHours } = await import('./opening-hours')
    const hours = [1, 2, 3, 4, 5].map((weekday) => ({
      weekday,
      opensAt: parseLocalTime('08:00'),
      closesAt: parseLocalTime(weekday % 2 ? '18:00' : '18:30'),
    }))

    expect(
      summarizeWeekHours([
        ...hours,
        { weekday: 6, opensAt: parseLocalTime('08:00'), closesAt: parseLocalTime('12:00') },
      ]),
    ).toEqual([
      { label: 'Segunda a sexta', opensAt: '08:00', closesAt: '18:30' },
      { label: 'Sábado', opensAt: '08:00', closesAt: '12:00' },
    ])
  })

  it('describes partial weeks and single days', async () => {
    const { summarizeWeekHours, describeWeekdays } = await import('./opening-hours')

    expect(
      summarizeWeekHours([
        { weekday: 2, opensAt: parseLocalTime('09:00'), closesAt: parseLocalTime('12:00') },
      ]),
    ).toEqual([{ label: 'Terça-feira', opensAt: '09:00', closesAt: '12:00' }])
    expect(describeWeekdays([2, 4])).toBe('Ter e Qui')
    expect(describeWeekdays([])).toBe('')
  })
})
