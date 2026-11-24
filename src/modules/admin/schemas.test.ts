import { describe, expect, it } from 'vitest'
import { blockFormSchema } from './schemas'

const base = {
  dentistId: '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0001',
  date: '2026-12-02',
  reason: 'Curso de atualização',
}

describe('blockFormSchema', () => {
  it('turns a partial-day block into clinic-time instants', () => {
    const parsed = blockFormSchema.parse({ ...base, startTime: '14:00', endTime: '18:00' })

    expect(parsed.start.toISOString()).toBe('2026-12-02T17:00:00.000Z')
    expect(parsed.end.toISOString()).toBe('2026-12-02T21:00:00.000Z')
  })

  it('covers the whole clinic day when "dia inteiro" is checked', () => {
    const parsed = blockFormSchema.parse({ ...base, allDay: 'on', startTime: '', endTime: '' })

    expect(parsed.start.toISOString()).toBe('2026-12-02T03:00:00.000Z')
    expect(parsed.end.toISOString()).toBe('2026-12-03T03:00:00.000Z')
  })

  it('rejects an end before the start and missing times', () => {
    const inverted = blockFormSchema.safeParse({ ...base, startTime: '15:00', endTime: '09:00' })
    const missing = blockFormSchema.safeParse({ ...base, startTime: '', endTime: '' })

    expect(inverted.success).toBe(false)
    expect(missing.success).toBe(false)
  })

  it('rejects impossible dates and empty reasons', () => {
    expect(blockFormSchema.safeParse({ ...base, date: '2026-02-30', allDay: 'on' }).success).toBe(
      false,
    )
    expect(blockFormSchema.safeParse({ ...base, reason: ' ', allDay: 'on' }).success).toBe(false)
  })
})
