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
  it('collapses a run of consecutive days into a span', () => {
    expect(describeWorkingDays([1, 2, 3, 4, 5, 6].map(at))).toEqual({
      kind: 'span',
      first: 1,
      last: 6,
    })
  })

  it('lists scattered days Monday first', () => {
    expect(describeWorkingDays([6, 2, 4].map(at))).toEqual({ kind: 'list', days: [2, 4, 6] })
    expect(describeWorkingDays([1, 3, 5].map(at))).toEqual({ kind: 'list', days: [1, 3, 5] })
  })

  it('keeps short runs as a list', () => {
    expect(describeWorkingDays([2, 3].map(at))).toEqual({ kind: 'list', days: [2, 3] })
  })
})
