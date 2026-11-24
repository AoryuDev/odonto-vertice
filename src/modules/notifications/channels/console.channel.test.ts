import { describe, expect, it, vi } from 'vitest'
import { consoleChannel } from './console.channel'

describe('console channel', () => {
  it('logs the short text version and always succeeds', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})

    const receipt = await consoleChannel.send({
      kind: 'confirmation',
      patient: { name: 'Ana Souza', email: 'ana@example.com', phone: '+5562991234567' },
      appointment: {
        treatmentName: 'Avaliação',
        dentistName: 'Dra. Helena Prado',
        startsAt: new Date('2026-11-25T12:00:00Z'),
        endsAt: new Date('2026-11-25T12:30:00Z'),
        manageUrl: 'https://example.com/agendamento/t',
      },
    })

    expect(receipt).toEqual({ ok: true })
    expect(info.mock.calls[0]?.[0]).toContain('[notification:confirmation] → ana@example.com')
    info.mockRestore()
  })
})
