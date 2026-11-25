import { z } from 'zod'
import { localeSchema } from '@/i18n/locale-schema'
import { issue } from '@/i18n/validation'
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
    paymentMethod: z.enum(['private', 'insurance'], issue('paymentRequired')),
    insuranceProvider: z
      .string(issue('insuranceRequired'))
      .trim()
      .max(80, issue('insuranceTooLong'))
      .optional(),
    notes: z.string(issue('notesTooLong')).trim().max(500, issue('notesTooLong')).optional(),
    consent: z.literal(true, issue('consentRequired')),
    company: z.string().max(0).optional(),
  })
  .superRefine((value, context) => {
    if (value.paymentMethod === 'insurance' && (value.insuranceProvider ?? '').length < 2) {
      context.addIssue({
        code: 'custom',
        path: ['insuranceProvider'],
        message: issue('insuranceRequired'),
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
  locale: localeSchema,
})

export type BookingRequest = z.output<typeof bookingRequestSchema>

export const manageTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)

export const rescheduleRequestSchema = z.object({
  token: manageTokenSchema,
  startsAt: z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
})

export const PATIENT_CANCELLATION_REASONS = [
  'schedule_conflict',
  'resolved_elsewhere',
  'health_issue',
  'financial',
] as const

export type PatientCancellationReason = (typeof PATIENT_CANCELLATION_REASONS)[number]

export const cancelRequestSchema = z.object({
  token: manageTokenSchema,
  reason: z.enum(PATIENT_CANCELLATION_REASONS).optional(),
})
