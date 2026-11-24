import { describe, expect, it } from 'vitest'
import {
  formatDuration,
  formatHour,
  formatList,
  formatLongDate,
  formatShortDate,
  formatTime,
  formatWeekday,
  formatWeekdayShort,
} from './format'

const morning = new Date('2026-11-24T11:30:00Z')

describe('locale-aware formatting in the clinic time zone', () => {
  it('formats dates and times in Portuguese', () => {
    expect(formatLongDate(morning, 'pt')).toBe('terça-feira, 24 de novembro')
    expect(formatShortDate(morning, 'pt')).toBe('24/11')
    expect(formatTime(morning, 'pt')).toBe('08:30')
    expect(formatWeekdayShort(morning, 'pt')).toBe('ter')
  })

  it('formats dates and times in English', () => {
    expect(formatLongDate(morning, 'en')).toBe('Tuesday, November 24')
    expect(formatShortDate(morning, 'en')).toBe('11/24')
    expect(formatTime(morning, 'en')).toBe('8:30\u00a0AM')
    expect(formatWeekdayShort(morning, 'en')).toBe('Tue')
  })

  it('names weekdays by index, Sunday first', () => {
    expect(formatWeekday(0, 'pt', 'long')).toBe('domingo')
    expect(formatWeekday(6, 'pt', 'short')).toBe('sáb')
    expect(formatWeekday(1, 'en', 'long')).toBe('Monday')
    expect(formatWeekday(3, 'en', 'short')).toBe('Wed')
  })

  it('never lets a 12-hour time break before AM or PM', () => {
    expect(formatTime(morning, 'en')).not.toContain(' ')
    expect(formatHour('19:00', 'en')).toBe('7\u00a0PM')
  })

  it('formats opening hours the way each language writes them', () => {
    expect(formatHour('08:00', 'pt')).toBe('8h')
    expect(formatHour('13:30', 'pt')).toBe('13h30')
    expect(formatHour('08:00', 'en')).toBe('8\u00a0AM')
    expect(formatHour('13:30', 'en')).toBe('1:30\u00a0PM')
  })

  it('formats durations and lists', () => {
    expect(formatDuration(30, 'pt')).toBe('30 min')
    expect(formatDuration(90, 'pt')).toBe('1 h 30 min')
    expect(formatDuration(60, 'en')).toBe('1 hr')
    expect(formatDuration(90, 'en')).toBe('1 hr 30 min')
    expect(formatList(['seg', 'qua', 'sex'], 'pt')).toBe('seg, qua e sex')
    expect(formatList(['A', 'B'], 'en', 'disjunction')).toBe('A or B')
  })
})
