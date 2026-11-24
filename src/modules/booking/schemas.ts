import { z } from 'zod'
import {
  patientEmailSchema,
  patientNameSchema,
  patientPhoneSchema,
} from '@/modules/patients/schemas'

export const ANY_DENTIST = 'qualquer'

export const slugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)

export const patientDetailsSchema = z
  .object({
    fullName: patientNameSchema,
    email: patientEmailSchema,
    phone: patientPhoneSchema,
    paymentMethod: z.enum(['private', 'insurance'], 'Escolha particular ou convênio.'),
    insuranceProvider: z.string().trim().max(80, 'Use no máximo 80 caracteres.').optional(),
    notes: z.string().trim().max(500, 'Use no máximo 500 caracteres.').optional(),
    consent: z.literal(true, 'Precisamos da sua autorização para registrar o agendamento.'),
    company: z.string().max(0).optional(),
  })
  .superRefine((value, context) => {
    if (value.paymentMethod === 'insurance' && (value.insuranceProvider ?? '').length < 2) {
      context.addIssue({
        code: 'custom',
        path: ['insuranceProvider'],
        message: 'Informe o nome do seu convênio.',
      })
    }
  })
  .transform(({ company: _company, ...value }) => ({
    ...value,
    insuranceProvider:
      value.paymentMethod === 'insurance' ? value.insuranceProvider || undefined : undefined,
    notes: value.notes || undefined,
  }))

export type PatientDetailsInput = z.input<typeof patientDetailsSchema>
export type PatientDetails = z.output<typeof patientDetailsSchema>

export const slotSelectionSchema = z.object({
  treatmentSlug: slugSchema,
  dentistSlug: z.union([z.literal(ANY_DENTIST), slugSchema]),
  startsAt: z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
})

export const bookingRequestSchema = z.object({
  slot: slotSelectionSchema,
  patient: patientDetailsSchema,
})

export type BookingRequest = z.output<typeof bookingRequestSchema>

export const manageTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)

export const rescheduleRequestSchema = z.object({
  token: manageTokenSchema,
  startsAt: z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
})

export const cancelRequestSchema = z.object({
  token: manageTokenSchema,
  reason: z.string().trim().max(280).optional(),
})
