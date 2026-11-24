import { describe, expect, it } from 'vitest'
import {
  computeDailySlots,
  findSlot,
  overlaps,
  rankDentistsForSlot,
  summarizeDays,
  type AvailabilityContext,
  type BusyPeriod,
  type WeeklySchedule,
} from './availability'
import { parseLocalDate, parseLocalTime, toLocalTime, type LocalDate } from './clinic-time'
import type { AvailabilityPolicy } from './policy'

const SAO_PAULO = 'America/Sao_Paulo'

const policy: AvailabilityPolicy = {
  timeZone: SAO_PAULO,
  slotStepMinutes: 15,
  minimumNoticeMinutes: 120,
  bookingHorizonDays: 30,
}

const HELENA = 'helena'
const CAMILA = 'camila'

const WEDNESDAY = parseLocalDate('2026-11-25')
const MONDAY_9AM = new Date('2026-11-23T09:00:00-03:00')

function schedule(
  dentistId: string,
  weekday: number,
  hours: [string, string],
  lunch: [string, string] | null = null,
): WeeklySchedule {
  return {
    dentistId,
    weekday,
    startsAt: parseLocalTime(hours[0]),
    endsAt: parseLocalTime(hours[1]),
    lunch: lunch ? { startsAt: parseLocalTime(lunch[0]), endsAt: parseLocalTime(lunch[1]) } : null,
  }
}

function busy(dentistId: string, start: string, end: string): BusyPeriod {
  return { dentistId, start: new Date(start), end: new Date(end) }
}

const helenaWeekdays = [1, 2, 3, 4, 5].map((weekday) =>
  schedule(HELENA, weekday, ['08:00', '18:00'], ['12:00', '13:30']),
)

function context(overrides: Partial<AvailabilityContext> = {}): AvailabilityContext {
  return {
    durationMinutes: 30,
    dentistIds: [HELENA],
    schedules: helenaWeekdays,
    holidays: new Set(),
    busy: [],
    now: MONDAY_9AM,
    policy,
    ...overrides,
  }
}

function localStarts(date: LocalDate, ctx: AvailabilityContext): string[] {
  return computeDailySlots(date, ctx).map((slot) => toLocalTime(slot.start, ctx.policy.timeZone))
}

describe('computeDailySlots', () => {
  it('offers every 15-minute start that fits in the morning and afternoon windows', () => {
    const starts = localStarts(WEDNESDAY, context())

    expect(starts).toHaveLength(15 + 17)
    expect(starts[0]).toBe('08:00')
    expect(starts).toContain('11:30')
    expect(starts).toContain('13:30')
    expect(starts.at(-1)).toBe('17:30')
  })

  it('returns slots as absolute instants in the clinic time zone', () => {
    const [first] = computeDailySlots(WEDNESDAY, context())

    expect(first?.start.toISOString()).toBe('2026-11-25T11:00:00.000Z')
    expect(first?.end.toISOString()).toBe('2026-11-25T11:30:00.000Z')
  })

  it('never offers a slot that would run into lunch or past closing time', () => {
    const starts = localStarts(WEDNESDAY, context({ durationMinutes: 60 }))

    expect(starts).toContain('11:00')
    expect(starts).not.toContain('11:15')
    expect(starts).not.toContain('12:00')
    expect(starts).not.toContain('13:15')
    expect(starts).toContain('13:30')
    expect(starts.at(-1)).toBe('17:00')
  })

  it('offers a slot that ends exactly when lunch begins', () => {
    const starts = localStarts(WEDNESDAY, context({ durationMinutes: 45 }))

    expect(starts).toContain('11:15')
    expect(starts).not.toContain('11:30')
  })

  it('handles a schedule without lunch break', () => {
    const saturday = parseLocalDate('2026-11-28')
    const ctx = context({ schedules: [schedule(HELENA, 6, ['08:00', '12:00'])] })

    const starts = localStarts(saturday, ctx)

    expect(starts[0]).toBe('08:00')
    expect(starts.at(-1)).toBe('11:30')
    expect(starts).toHaveLength(15)
  })

  it('removes every start that overlaps an existing appointment, on both edges', () => {
    const ctx = context({
      busy: [busy(HELENA, '2026-11-25T09:00:00-03:00', '2026-11-25T09:45:00-03:00')],
    })

    const starts = localStarts(WEDNESDAY, ctx)

    expect(starts).toContain('08:30')
    expect(starts).not.toContain('08:45')
    expect(starts).not.toContain('09:00')
    expect(starts).not.toContain('09:30')
    expect(starts).toContain('09:45')
  })

  it('treats periods as half-open, so back-to-back appointments are allowed', () => {
    const ctx = context({
      busy: [busy(HELENA, '2026-11-25T10:00:00-03:00', '2026-11-25T10:30:00-03:00')],
    })

    const starts = localStarts(WEDNESDAY, ctx)

    expect(starts).toContain('09:30')
    expect(starts).toContain('10:30')
  })

  it('removes the whole day when a manual block spans several days', () => {
    const ctx = context({
      busy: [busy(HELENA, '2026-11-24T00:00:00-03:00', '2026-11-27T00:00:00-03:00')],
    })

    expect(computeDailySlots(WEDNESDAY, ctx)).toEqual([])
    expect(computeDailySlots(parseLocalDate('2026-11-27'), ctx)).not.toEqual([])
  })

  it('ignores busy periods that belong to other dentists', () => {
    const ctx = context({
      busy: [busy(CAMILA, '2026-11-25T08:00:00-03:00', '2026-11-25T18:00:00-03:00')],
    })

    expect(computeDailySlots(WEDNESDAY, ctx)).toHaveLength(32)
  })

  it('returns nothing on clinic holidays', () => {
    const ctx = context({ holidays: new Set([WEDNESDAY]) })

    expect(computeDailySlots(WEDNESDAY, ctx)).toEqual([])
  })

  it('returns nothing on days the dentist does not work', () => {
    expect(computeDailySlots(parseLocalDate('2026-11-29'), context())).toEqual([])
  })

  it('respects the minimum notice on the current day', () => {
    const ctx = context({ now: new Date('2026-11-25T10:10:00-03:00') })

    const starts = localStarts(WEDNESDAY, ctx)

    expect(starts[0]).toBe('13:30')
  })

  it('keeps a start that lands exactly on the minimum notice boundary', () => {
    const ctx = context({ now: new Date('2026-11-25T07:00:00-03:00') })

    expect(localStarts(WEDNESDAY, ctx)[0]).toBe('09:00')
  })

  it('returns nothing for past dates and dates beyond the booking horizon', () => {
    expect(computeDailySlots(parseLocalDate('2026-11-20'), context())).toEqual([])
    expect(computeDailySlots(parseLocalDate('2026-12-24'), context())).toEqual([])
    expect(computeDailySlots(parseLocalDate('2026-12-23'), context())).not.toEqual([])
  })

  it('uses the clinic calendar date even when UTC has already moved to the next day', () => {
    const lateEvening = new Date('2026-11-24T22:30:00-03:00')
    const ctx = context({ now: lateEvening })

    expect(computeDailySlots(parseLocalDate('2026-11-24'), ctx)).toEqual([])
    expect(localStarts(WEDNESDAY, ctx)[0]).toBe('08:00')
  })

  it('returns nothing for a non-positive duration', () => {
    expect(computeDailySlots(WEDNESDAY, context({ durationMinutes: 0 }))).toEqual([])
  })

  it('returns nothing when the treatment is longer than any window', () => {
    const ctx = context({
      schedules: [schedule(HELENA, 3, ['08:00', '09:00'])],
      durationMinutes: 90,
    })

    expect(computeDailySlots(WEDNESDAY, ctx)).toEqual([])
  })

  it('merges dentists with different schedules and lists who is free at each start', () => {
    const ctx = context({
      dentistIds: [HELENA, CAMILA],
      schedules: [...helenaWeekdays, schedule(CAMILA, 3, ['09:00', '18:00'], ['12:30', '14:00'])],
      busy: [busy(HELENA, '2026-11-25T09:00:00-03:00', '2026-11-25T09:30:00-03:00')],
    })

    const slots = computeDailySlots(WEDNESDAY, ctx)
    const at = (time: string) =>
      slots.find((slot) => toLocalTime(slot.start, SAO_PAULO) === time)?.dentistIds

    expect(at('08:00')).toEqual([HELENA])
    expect(at('09:00')).toEqual([CAMILA])
    expect(at('10:00')).toEqual([HELENA, CAMILA])
    expect(at('12:00')).toEqual([CAMILA])
    expect(at('13:30')).toEqual([HELENA])
    expect(slots.map((slot) => slot.start.getTime())).toEqual(
      [...slots.map((slot) => slot.start.getTime())].sort((a, b) => a - b),
    )
  })

  it('measures windows in real elapsed time across a daylight saving change', () => {
    const springForward = parseLocalDate('2026-03-08')
    const ctx = context({
      policy: { ...policy, timeZone: 'America/New_York', slotStepMinutes: 30 },
      schedules: [schedule(HELENA, 0, ['01:00', '04:00'])],
      durationMinutes: 60,
      now: new Date('2026-03-01T12:00:00Z'),
    })

    const starts = localStarts(springForward, ctx)

    expect(starts).toEqual(['01:00', '01:30', '03:00'])
  })
})

describe('findSlot', () => {
  it('finds a free aligned start', () => {
    const start = new Date('2026-11-25T14:15:00-03:00')

    expect(findSlot(WEDNESDAY, start, context())?.dentistIds).toEqual([HELENA])
  })

  it('rejects starts that are not on the slot grid', () => {
    const start = new Date('2026-11-25T14:05:00-03:00')

    expect(findSlot(WEDNESDAY, start, context())).toBeUndefined()
  })

  it('rejects starts that became busy', () => {
    const start = new Date('2026-11-25T14:15:00-03:00')
    const ctx = context({
      busy: [busy(HELENA, '2026-11-25T14:00:00-03:00', '2026-11-25T14:30:00-03:00')],
    })

    expect(findSlot(WEDNESDAY, start, ctx)).toBeUndefined()
  })
})

describe('rankDentistsForSlot', () => {
  const both = context({
    dentistIds: [HELENA, CAMILA],
    schedules: [...helenaWeekdays, schedule(CAMILA, 3, ['08:00', '18:00'])],
  })

  it('prefers the dentist with fewer appointments that day', () => {
    const ctx = {
      ...both,
      busy: [
        busy(HELENA, '2026-11-25T08:00:00-03:00', '2026-11-25T08:30:00-03:00'),
        busy(HELENA, '2026-11-25T15:00:00-03:00', '2026-11-25T15:30:00-03:00'),
      ],
    }
    const slot = findSlot(WEDNESDAY, new Date('2026-11-25T10:00:00-03:00'), ctx)

    expect(slot && rankDentistsForSlot(slot, ctx)).toEqual([CAMILA, HELENA])
  })

  it('keeps the original order when the workload is the same', () => {
    const slot = findSlot(WEDNESDAY, new Date('2026-11-25T10:00:00-03:00'), both)

    expect(slot && rankDentistsForSlot(slot, both)).toEqual([HELENA, CAMILA])
  })
})

describe('summarizeDays', () => {
  it('covers the whole horizon and reports empty weekends and holidays', () => {
    const ctx = context({ holidays: new Set(['2026-11-26']) })

    const days = summarizeDays(ctx)
    const count = (date: string) => days.find((day) => day.date === date)?.slotCount

    expect(days).toHaveLength(policy.bookingHorizonDays + 1)
    expect(days[0]?.date).toBe('2026-11-23')
    expect(count('2026-11-25')).toBe(32)
    expect(count('2026-11-26')).toBe(0)
    expect(count('2026-11-29')).toBe(0)
  })
})

describe('overlaps', () => {
  const interval = (start: string, end: string) => ({ start: new Date(start), end: new Date(end) })

  it.each([
    ['contained', '2026-01-01T10:10:00Z', '2026-01-01T10:20:00Z', true],
    ['crossing the start', '2026-01-01T09:50:00Z', '2026-01-01T10:10:00Z', true],
    ['crossing the end', '2026-01-01T10:20:00Z', '2026-01-01T10:40:00Z', true],
    ['touching the start', '2026-01-01T09:30:00Z', '2026-01-01T10:00:00Z', false],
    ['touching the end', '2026-01-01T10:30:00Z', '2026-01-01T11:00:00Z', false],
  ])('%s → %s', (_label, start, end, expected) => {
    const base = interval('2026-01-01T10:00:00Z', '2026-01-01T10:30:00Z')

    expect(overlaps(base, interval(start, end))).toBe(expected)
  })
})
