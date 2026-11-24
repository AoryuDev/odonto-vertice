import { z } from 'zod'
import type { WeeklySchedule } from '@/modules/schedule/domain/availability'

export const treatmentContentSchema = z.object({
  intro: z.array(z.string().min(1)).min(1),
  forWhom: z.array(z.string().min(1)).default([]),
  steps: z.array(z.object({ title: z.string().min(1), body: z.string().min(1) })).default([]),
  preparation: z.array(z.string().min(1)).default([]),
  aftercare: z.array(z.string().min(1)).default([]),
  faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).default([]),
})

export type TreatmentContent = z.infer<typeof treatmentContentSchema>

export const SPECIALTY_LABELS = {
  general_dentistry: 'Clínica geral',
  orthodontics: 'Ortodontia',
  implantology: 'Implantodontia',
} as const

export type Specialty = keyof typeof SPECIALTY_LABELS

export type Treatment = {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly durationMinutes: number
  readonly summary: string
  readonly content: TreatmentContent
  readonly photoKey: string
  readonly isUrgent: boolean
  readonly dentistIds: readonly string[]
}

export type Dentist = {
  readonly id: string
  readonly slug: string
  readonly fullName: string
  readonly displayName: string
  readonly specialty: Specialty
  readonly croRegistration: string
  readonly headline: string
  readonly bio: readonly string[]
  readonly education: readonly string[]
  readonly photoKey: string
  readonly isTechnicalLead: boolean
  readonly treatmentIds: readonly string[]
  readonly schedules: readonly WeeklySchedule[]
}
