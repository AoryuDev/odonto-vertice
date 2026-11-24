import { describe, expect, it } from 'vitest'
import en from '../../../messages/en.json'
import pt from '../../../messages/pt.json'
import { bookingRequestSchema, cancelRequestSchema, patientDetailsSchema } from './schemas'

const validPatient = {
  fullName: '  Mariana Lopes Ribeiro ',
  email: 'Mariana.Ribeiro@Example.com',
  phone: '(62) 99123-4567',
  paymentMethod: 'private',
  consent: true,
} as const

function issuesOf(input: unknown) {
  const result = patientDetailsSchema.safeParse(input)
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((i) => [i.path.join('.'), i.message]))
}

describe('patientDetailsSchema', () => {
  it('normalizes name, e-mail and phone', () => {
    const parsed = patientDetailsSchema.parse(validPatient)

    expect(parsed).toEqual({
      fullName: 'Mariana Lopes Ribeiro',
      email: 'mariana.ribeiro@example.com',
      phone: '+5562991234567',
      paymentMethod: 'private',
      insuranceProvider: undefined,
      notes: undefined,
      consent: true,
    })
  })

  it('asks for the insurance name only when paying with insurance', () => {
    expect(issuesOf({ ...validPatient, paymentMethod: 'insurance' })).toEqual({
      insuranceProvider: 'insuranceRequired',
    })
    expect(
      patientDetailsSchema.parse({ ...validPatient, insuranceProvider: 'Plano X' })
        .insuranceProvider,
    ).toBeUndefined()
  })

  it('requires a full name, a valid phone and explicit consent', () => {
    expect(
      issuesOf({ ...validPatient, fullName: 'Mariana', phone: '1234', consent: false }),
    ).toEqual({
      fullName: 'nameIncomplete',
      phone: 'phoneInvalid',
      consent: 'consentRequired',
    })
  })

  it('reports every problem as a key translated in both languages', () => {
    const broken = [
      {},
      { fullName: '', email: '', phone: '', paymentMethod: 'cash', consent: false },
      {
        ...validPatient,
        fullName: `Ana ${'x'.repeat(130)}`,
        email: `${'a'.repeat(250)}@example.com`,
        phone: '(00) 0000',
        paymentMethod: 'insurance',
        insuranceProvider: 'x'.repeat(90),
        notes: 'x'.repeat(600),
      },
      { ...validPatient, email: 'mariana@', paymentMethod: 'insurance', insuranceProvider: '' },
    ]
    const messages = new Set(
      broken.flatMap((input) => {
        const result = patientDetailsSchema.safeParse(input)
        return result.success ? [] : result.error.issues.map((issue) => issue.message)
      }),
    )

    expect(messages.size).toBeGreaterThanOrEqual(12)
    for (const message of messages) {
      expect(Object.keys(pt.validation)).toContain(message)
      expect(Object.keys(en.validation)).toContain(message)
    }
  })

  it('rejects submissions that filled the honeypot field', () => {
    expect(patientDetailsSchema.safeParse({ ...validPatient, company: 'ACME' }).success).toBe(false)
  })
})

describe('bookingRequestSchema', () => {
  it('requires an ISO instant with offset and known slug formats', () => {
    const result = bookingRequestSchema.safeParse({
      slot: { treatmentSlug: 'limpeza', dentistSlug: 'qualquer', startsAt: '2026-11-25T09:00' },
      patient: validPatient,
      locale: 'pt',
    })

    expect(result.success).toBe(false)
  })

  it('parses the selected start into a Date', () => {
    const parsed = bookingRequestSchema.parse({
      slot: {
        treatmentSlug: 'limpeza',
        dentistSlug: 'helena-prado',
        startsAt: '2026-11-25T09:00:00-03:00',
      },
      patient: validPatient,
      locale: 'pt',
    })

    expect(parsed.slot.startsAt.toISOString()).toBe('2026-11-25T12:00:00.000Z')
  })
})

describe('cancelRequestSchema', () => {
  const token = 'a'.repeat(43)

  it('accepts only the reason codes offered on the manage page', () => {
    expect(cancelRequestSchema.parse({ token, reason: 'health_issue' }).reason).toBe('health_issue')
    expect(cancelRequestSchema.parse({ token }).reason).toBeUndefined()
    expect(cancelRequestSchema.safeParse({ token, reason: 'Problema de saúde' }).success).toBe(
      false,
    )
  })
})
