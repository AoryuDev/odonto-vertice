import { describe, expect, it } from 'vitest'
import { renderEmail, renderShortText } from './templates'
import type { AppointmentNotice } from './types'

const notice: AppointmentNotice = {
  kind: 'reminder',
  patient: { name: 'Mariana <b>Lopes</b>', email: 'mariana@example.com', phone: '+5562991234567' },
  appointment: {
    treatmentName: 'Limpeza',
    dentistName: 'Dra. Helena Prado',
    startsAt: new Date('2026-11-25T09:00:00-03:00'),
    endsAt: new Date('2026-11-25T09:45:00-03:00'),
    manageUrl: 'https://odontovertice.example/agendamento/abc',
  },
}

describe('notification templates', () => {
  it('writes the date in Portuguese using the clinic time zone', () => {
    const text = renderShortText(notice)

    expect(text).toContain('Quarta-feira, 25 de novembro, às 09:00')
    expect(text).toContain('Limpeza com Dra. Helena Prado')
    expect(text).toContain('https://odontovertice.example/agendamento/abc')
  })

  it('uses a subject that fits the notice kind', () => {
    expect(renderEmail(notice).subject).toBe('Lembrete: amanhã às 09:00 na Odonto Vértice')
    expect(renderEmail({ ...notice, kind: 'confirmation' }).subject).toBe(
      'Consulta confirmada — Limpeza, 09:00',
    )
  })

  it('escapes patient-provided values in the HTML body', () => {
    const hostile = {
      ...notice,
      patient: { ...notice.patient, name: '<script>alert(1)</script> X' },
    }

    const { html } = renderEmail(hostile)

    expect(html).toContain('Olá, &lt;script&gt;alert(1)&lt;/script&gt;.')
    expect(html).not.toContain('<script>')
  })
})
