import { describe, expect, it, vi } from 'vitest'
import type { AppointmentNotice } from '../types'
import { createEmailChannel } from './email.channel'

const notice: AppointmentNotice = {
  kind: 'confirmation',
  patient: { name: 'Mariana Lopes', email: 'mariana@example.com', phone: '+5562991234567' },
  appointment: {
    treatmentName: 'Avaliação',
    dentistName: 'Dra. Helena Prado',
    startsAt: new Date('2026-11-25T09:00:00-03:00'),
    endsAt: new Date('2026-11-25T09:30:00-03:00'),
    manageUrl: 'https://odontovertice.example/agendamento/token123',
  },
}

describe('email channel', () => {
  it('posts the rendered e-mail to Resend with an idempotency key', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => Response.json({ id: 'msg_1' }))
    const channel = createEmailChannel({ apiKey: 're_test', from: 'Clínica <a@b.com>', fetcher })

    const receipt = await channel.send(notice)

    expect(receipt).toEqual({ ok: true, providerMessageId: 'msg_1' })
    const [url, init] = fetcher.mock.calls[0] ?? []
    expect(url).toBe('https://api.resend.com/emails')
    expect(new Headers(init?.headers).get('Idempotency-Key')).toBe(
      `confirmation-token123-${notice.appointment.startsAt.getTime()}`,
    )
    expect(JSON.parse(String(init?.body))).toMatchObject({
      to: ['mariana@example.com'],
      subject: 'Consulta confirmada — Avaliação, 09:00',
    })
  })

  it('reports provider errors instead of throwing', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response('invalid from', { status: 422 }))
    const channel = createEmailChannel({ apiKey: 're_test', from: 'x', fetcher })

    await expect(channel.send(notice)).resolves.toEqual({
      ok: false,
      error: 'Resend responded 422: invalid from',
    })
  })

  it('reports network failures instead of throwing', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => {
      throw new Error('ECONNRESET')
    })
    const channel = createEmailChannel({ apiKey: 're_test', from: 'x', fetcher })

    await expect(channel.send(notice)).resolves.toEqual({ ok: false, error: 'ECONNRESET' })
  })
})
