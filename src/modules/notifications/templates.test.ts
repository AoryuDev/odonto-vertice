import { describe, expect, it } from 'vitest'
import { renderEmail, renderShortText } from './templates'
import type { AppointmentNotice } from './types'

const notice: AppointmentNotice = {
  kind: 'reminder',
  locale: 'pt',
  patient: { name: 'Mariana <b>Lopes</b>', email: 'mariana@example.com', phone: '+5562991234567' },
  appointment: {
    treatmentName: 'Limpeza',
    dentistName: 'Dra. Helena Prado',
    startsAt: new Date('2026-11-25T09:00:00-03:00'),
    endsAt: new Date('2026-11-25T09:45:00-03:00'),
    manageUrl: 'https://odontovertice.example/pt/agendamento/abc',
  },
}

const english: AppointmentNotice = {
  ...notice,
  locale: 'en',
  appointment: {
    ...notice.appointment,
    treatmentName: 'Cleaning',
    dentistName: 'Dr. Helena Prado',
    manageUrl: 'https://odontovertice.example/en/agendamento/abc',
  },
}

describe('notification templates', () => {
  it('writes the date in Portuguese using the clinic time zone', () => {
    const text = renderShortText(notice)

    expect(text).toContain('Quarta-feira, 25 de novembro, às 09:00')
    expect(text).toContain('Limpeza com Dra. Helena Prado')
    expect(text).toContain('https://odontovertice.example/pt/agendamento/abc')
  })

  it('writes the whole message in English when the patient booked in English', () => {
    const email = renderEmail(english)

    expect(email.subject).toBe('Reminder: tomorrow at 9:00\u00a0AM at Odonto Vértice')
    expect(email.text).toContain('Hi Mariana.')
    expect(email.text).toContain('Wednesday, November 25 at 9:00\u00a0AM')
    expect(email.text).toContain('Cleaning with Dr. Helena Prado')
    expect(email.text).toContain('https://odontovertice.example/en/agendamento/abc')
    expect(email.html).toContain('<html lang="en">')
    expect(email.html).toContain('Please arrive 10 minutes early.')
    expect(email.html).not.toMatch(/Olá|Quando|Consulta|Chegue/)
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

describe('every notice kind', () => {
  it.each([
    ['pt', 'confirmation', 'Sua consulta está confirmada'],
    ['pt', 'reminder', 'Até amanhã'],
    ['pt', 'reschedule', 'Novo horário confirmado'],
    ['pt', 'cancellation', 'Consulta cancelada'],
    ['en', 'confirmation', 'Your appointment is confirmed'],
    ['en', 'reminder', 'See you tomorrow'],
    ['en', 'reschedule', 'Your new time is confirmed'],
    ['en', 'cancellation', 'Appointment cancelled'],
  ] as const)('renders %s %s with its own heading', (locale, kind, heading) => {
    const email = renderEmail({ ...(locale === 'en' ? english : notice), kind })

    expect(email.html).toContain(heading)
    expect(email.text.startsWith(`Odonto Vértice — ${heading}`)).toBe(true)
  })
})
