import { z } from 'zod'
import { issue } from '@/i18n/validation'
import { normalizeBrazilianPhone } from './phone'

export const patientNameSchema = z
  .string(issue('nameRequired'))
  .trim()
  .min(1, issue('nameRequired'))
  .max(120, issue('nameTooLong'))
  .refine((value) => value.split(/\s+/).length >= 2, issue('nameIncomplete'))

export const patientEmailSchema = z
  .string(issue('emailRequired'))
  .trim()
  .min(1, issue('emailRequired'))
  .max(254, issue('emailTooLong'))
  .pipe(z.email(issue('emailInvalid')))
  .transform((value) => value.toLowerCase())

export const patientPhoneSchema = z
  .string(issue('phoneRequired'))
  .trim()
  .min(1, issue('phoneRequired'))
  .transform((value, context) => {
    const normalized = normalizeBrazilianPhone(value)
    if (!normalized) {
      context.addIssue({ code: 'custom', message: issue('phoneInvalid') })
      return z.NEVER
    }
    return normalized
  })
