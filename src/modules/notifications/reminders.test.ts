import { describe, expect, it, vi } from 'vitest'
import { dispatchReminders, tomorrowWindow, type ClaimedReminder } from './reminders'
import type { NotificationChannel } from './types'

const TZ = 'America/Sao_Paulo'

function reminder(id: string): ClaimedReminder {
  return {
    deliveryId: `d-${id}`,
    appointmentId: `a-${id}`,
    startsAt: new Date('2026-11-25T12:00:00Z'),
    endsAt: new Date('2026-11-25T12:30:00Z'),
    patientName: 'Mariana Lopes',
    patientEmail: `${id}@example.com`,
    patientPhone: '+5562991234567',
    dentistName: 'Dra. Helena Prado',
    treatmentName: 'Avaliação',
  }
}

describe('tomorrowWindow', () => {
  it('covers the next clinic calendar day, midnight to midnight in São Paulo', () => {
    const window = tomorrowWindow(new Date('2026-11-24T21:00:00Z'), TZ)

    expect(window.from.toISOString()).toBe('2026-11-25T03:00:00.000Z')
    expect(window.to.toISOString()).toBe('2026-11-26T03:00:00.000Z')
  })

  it('uses the clinic date, not the UTC date, late in the evening', () => {
    const window = tomorrowWindow(new Date('2026-11-25T02:30:00Z'), TZ)

    expect(window.from.toISOString()).toBe('2026-11-25T03:00:00.000Z')
  })
})

describe('dispatchReminders', () => {
  const window = tomorrowWindow(new Date('2026-11-24T21:00:00Z'), TZ)

  it('sends one reminder per claimed appointment and records every receipt', async () => {
    const channel: NotificationChannel = {
      name: 'email',
      send: vi.fn(async (notice) =>
        notice.patient.email.startsWith('2')
          ? { ok: false as const, error: 'bounce' }
          : { ok: true as const },
      ),
    }
    const record = vi.fn(async () => {})
    const claim = vi.fn(async () => ['1', '2', '3'].map(reminder))

    const run = await dispatchReminders(window, {
      channel,
      claim,
      record,
      manageUrl: (id) => `https://example.com/agendamento/${id}`,
      concurrency: 2,
    })

    expect(run).toMatchObject({ claimed: 3, sent: 2, failed: 1 })
    expect(claim).toHaveBeenCalledWith(window, 'email')
    expect(record).toHaveBeenCalledWith('d-2', { ok: false, error: 'bounce' })
    expect(vi.mocked(channel.send).mock.calls[0]?.[0]).toMatchObject({
      kind: 'reminder',
      appointment: { manageUrl: 'https://example.com/agendamento/a-1' },
    })
  })

  it('records a failure when the channel throws instead of aborting the run', async () => {
    const channel: NotificationChannel = {
      name: 'console',
      send: vi.fn(async () => {
        throw new Error('timeout')
      }),
    }
    const record = vi.fn(async () => {})

    const run = await dispatchReminders(window, {
      channel,
      claim: async () => [reminder('1')],
      record,
      manageUrl: () => 'x',
    })

    expect(run).toMatchObject({ claimed: 1, sent: 0, failed: 1 })
    expect(record).toHaveBeenCalledWith('d-1', { ok: false, error: 'timeout' })
  })

  it('does nothing when there is nothing to claim', async () => {
    const channel: NotificationChannel = { name: 'email', send: vi.fn() }

    const run = await dispatchReminders(window, {
      channel,
      claim: async () => [],
      record: vi.fn(),
      manageUrl: () => 'x',
    })

    expect(run).toMatchObject({ claimed: 0, sent: 0, failed: 0 })
    expect(channel.send).not.toHaveBeenCalled()
  })
})
