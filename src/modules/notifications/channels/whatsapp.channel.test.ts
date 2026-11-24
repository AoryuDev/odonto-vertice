import { describe, expect, it, vi } from 'vitest'
import type { AppointmentNotice } from '../types'
import { createWhatsAppChannel, whatsappTemplatePayload } from './whatsapp.channel'

const notice: AppointmentNotice = {
  kind: 'reminder',
  patient: { name: 'Mariana Lopes', email: 'm@example.com', phone: '+5562991234567' },
  appointment: {
    treatmentName: 'Limpeza',
    dentistName: 'Dra. Helena Prado',
    startsAt: new Date('2026-11-25T09:00:00-03:00'),
    endsAt: new Date('2026-11-25T09:45:00-03:00'),
    manageUrl: 'https://example.com/agendamento/t',
  },
}

const config = {
  accessToken: 'token',
  phoneNumberId: '123',
  templates: {
    confirmation: 'consulta_confirmada',
    reminder: 'consulta_lembrete',
    reschedule: 'consulta_remarcada',
    cancellation: 'consulta_cancelada',
  },
} as const

describe('WhatsApp channel', () => {
  it('maps the notice kind to an approved template with ordered body parameters', () => {
    const payload = whatsappTemplatePayload(notice, config)

    expect(payload.to).toBe('5562991234567')
    expect(payload.template.name).toBe('consulta_lembrete')
    expect(payload.template.components[0]?.parameters.map((parameter) => parameter.text)).toEqual([
      'Mariana',
      'Limpeza',
      'Dra. Helena Prado',
      'Quarta-feira, 25 de novembro, 09:00',
      'https://example.com/agendamento/t',
    ])
  })

  it('posts to the Cloud API and returns the message id', async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      Response.json({ messages: [{ id: 'wamid.1' }] }),
    )
    const channel = createWhatsAppChannel({ ...config, fetcher })

    await expect(channel.send(notice)).resolves.toEqual({ ok: true, providerMessageId: 'wamid.1' })
    expect(fetcher.mock.calls[0]?.[0]).toBe('https://graph.facebook.com/v21.0/123/messages')
  })
})

describe('WhatsApp channel failures', () => {
  it('reports API and network errors without throwing', async () => {
    const rejected = createWhatsAppChannel({
      ...config,
      fetcher: vi.fn<typeof fetch>(
        async () => new Response('template not approved', { status: 400 }),
      ),
    })
    const offline = createWhatsAppChannel({
      ...config,
      fetcher: vi.fn<typeof fetch>(async () => {
        throw new Error('ENOTFOUND')
      }),
    })

    await expect(rejected.send(notice)).resolves.toEqual({
      ok: false,
      error: 'WhatsApp responded 400: template not approved',
    })
    await expect(offline.send(notice)).resolves.toEqual({ ok: false, error: 'ENOTFOUND' })
  })
})
