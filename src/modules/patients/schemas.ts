import { z } from 'zod'
import { normalizeBrazilianPhone } from './phone'

export const patientNameSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu nome completo.')
  .max(120, 'Use no máximo 120 caracteres.')
  .refine((value) => value.split(/\s+/).length >= 2, 'Informe nome e sobrenome.')

export const patientEmailSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail.')
  .max(254, 'E-mail muito longo.')
  .pipe(z.email('Confira o e-mail: parece incompleto.'))
  .transform((value) => value.toLowerCase())

export const patientPhoneSchema = z
  .string()
  .trim()
  .min(1, 'Informe um telefone com DDD.')
  .transform((value, context) => {
    const normalized = normalizeBrazilianPhone(value)
    if (!normalized) {
      context.addIssue({ code: 'custom', message: 'Telefone inválido. Use DDD + número.' })
      return z.NEVER
    }
    return normalized
  })
