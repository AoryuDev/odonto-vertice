import { describe, expect, it } from 'vitest'
import { parseLocalTime } from '@/modules/schedule/domain/clinic-time'
import { describeWorkingDays } from './working-days'

const at = (weekday: number) => ({
  dentistId: 'd',
  weekday,
  startsAt: parseLocalTime('08:00'),
  endsAt: parseLocalTime('12:00'),
  lunch: null,
})

describe('describeWorkingDays', () => {
  it('collapses a run of consecutive days', () => {
    expect(describeWorkingDays([1, 2, 3, 4, 5, 6].map(at))).toBe('Atende de seg a sáb')
  })

  it('lists scattered days with a final "e"', () => {
    expect(describeWorkingDays([6, 2, 4].map(at))).toBe('Atende ter, qui e sáb')
    expect(describeWorkingDays([1, 3, 5].map(at))).toBe('Atende seg, qua e sex')
  })
})
