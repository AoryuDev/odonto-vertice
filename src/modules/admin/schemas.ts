import { z } from 'zod'
import {
  isLocalDate,
  parseLocalTime,
  toInstant,
  type LocalDate,
} from '@/modules/schedule/domain/clinic-time'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato HH:MM.')

export const blockFormSchema = z
  .object({
    dentistId: z.uuid('Escolha um dentista.'),
    date: z.string().refine(isLocalDate, 'Informe uma data válida.'),
    allDay: z.preprocess((value) => value === 'on' || value === true, z.boolean()),
    startTime: time.optional().or(z.literal('').transform(() => undefined)),
    endTime: time.optional().or(z.literal('').transform(() => undefined)),
    reason: z.string().trim().min(3, 'Descreva o motivo em poucas palavras.').max(140),
  })
  .superRefine((value, context) => {
    if (value.allDay) return
    if (!value.startTime)
      context.addIssue({ code: 'custom', path: ['startTime'], message: 'Informe o início.' })
    if (!value.endTime)
      context.addIssue({ code: 'custom', path: ['endTime'], message: 'Informe o fim.' })
    if (value.startTime && value.endTime && value.startTime >= value.endTime) {
      context.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'O fim precisa ser depois do início.',
      })
    }
  })
  .transform((value) => {
    const date = value.date as LocalDate
    const start = toInstant(
      date,
      parseLocalTime(value.allDay ? '00:00' : (value.startTime ?? '00:00')),
      CLINIC_TIME_ZONE,
    )
    const end = value.allDay
      ? new Date(start.getTime() + 24 * 60 * 60 * 1000)
      : toInstant(date, parseLocalTime(value.endTime ?? '00:00'), CLINIC_TIME_ZONE)
    return { dentistId: value.dentistId, start, end, reason: value.reason }
  })

export const appointmentIdSchema = z.uuid()

export const staffCancelSchema = z.object({
  id: appointmentIdSchema,
  reason: z.string().trim().min(3, 'Informe o motivo.').max(280),
  notify: z.preprocess((value) => value === 'on', z.boolean()),
})

export const staffRescheduleSchema = z.object({
  id: appointmentIdSchema,
  startsAt: z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
})

export const attendanceSchema = z.object({
  id: appointmentIdSchema,
  status: z.enum(['completed', 'no_show']),
})
