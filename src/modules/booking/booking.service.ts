import 'server-only'
import { createHmac, randomUUID } from 'node:crypto'
import { after } from 'next/server'
import { serverEnv } from '@/lib/env'
import { createServiceClient } from '@/lib/supabase/clients'
import { isExclusionViolation, raisedReason } from '@/lib/supabase/errors'
import { listDentists, listTreatments } from '@/modules/catalog/catalog.repository'
import type { Dentist, Treatment } from '@/modules/catalog/types'
import { sendAppointmentNotice } from '@/modules/notifications/notifier'
import { loadAvailabilityContext } from '@/modules/schedule/availability.service'
import {
  computeDailySlots,
  findSlot,
  rankDentistsForSlot,
} from '@/modules/schedule/domain/availability'
import { addDays, toLocalDate } from '@/modules/schedule/domain/clinic-time'
import { clinicPolicy } from '@/modules/schedule/domain/policy'
import { manageTokenFor } from './manage-token'
import { ANY_DENTIST, type BookingRequest } from './schemas'

export type BookingFailure =
  | 'slot_unavailable'
  | 'treatment_unavailable'
  | 'dentist_unavailable'
  | 'rate_limited'
  | 'unexpected'

export type BookingResult =
  | { readonly ok: true; readonly token: string }
  | { readonly ok: false; readonly reason: BookingFailure }

const RATE_LIMIT_WINDOW_MINUTES = 15
const RETRYABLE_REASONS = new Set(['slot_blocked', 'outside_working_hours', 'slot_in_past'])

export function candidateDentists(
  treatment: Treatment,
  dentists: readonly Dentist[],
  dentistSlug: string,
): Dentist[] {
  const offering = dentists.filter((dentist) => treatment.dentistIds.includes(dentist.id))
  return dentistSlug === ANY_DENTIST
    ? offering
    : offering.filter((dentist) => dentist.slug === dentistSlug)
}

export function clientFingerprint(clientAddress: string): string {
  const digest = createHmac('sha256', serverEnv().MANAGE_TOKEN_SECRET)
    .update(`booking:${clientAddress}`)
    .digest('hex')
  return `\\x${digest}`
}

async function registerAttempt(fingerprint: string): Promise<boolean> {
  const { data, error } = await createServiceClient().rpc('register_booking_attempt', {
    p_fingerprint: fingerprint,
    p_limit: serverEnv().BOOKING_RATE_LIMIT,
    p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
  })
  if (error) throw new Error(`Rate limit check failed: ${error.message}`)
  return data
}

export async function bookAppointment(
  request: BookingRequest,
  fingerprint: string,
): Promise<BookingResult> {
  const [treatments, dentists] = await Promise.all([listTreatments(), listDentists()])
  const treatment = treatments.find((candidate) => candidate.slug === request.slot.treatmentSlug)
  if (!treatment) return { ok: false, reason: 'treatment_unavailable' }

  const candidates = candidateDentists(treatment, dentists, request.slot.dentistSlug)
  if (candidates.length === 0) return { ok: false, reason: 'dentist_unavailable' }

  if (!(await registerAttempt(fingerprint))) return { ok: false, reason: 'rate_limited' }

  const context = await loadAvailabilityContext(treatment, candidates)
  const date = toLocalDate(request.slot.startsAt, clinicPolicy.timeZone)
  const slot = findSlot(date, request.slot.startsAt, context)
  if (!slot) return { ok: false, reason: 'slot_unavailable' }

  const db = createServiceClient()
  const { patient } = request

  for (const dentistId of rankDentistsForSlot(slot, context)) {
    const appointmentId = randomUUID()
    const { token, hash } = manageTokenFor(appointmentId, serverEnv().MANAGE_TOKEN_SECRET)
    const { error } = await db.rpc('book_appointment', {
      p_appointment_id: appointmentId,
      p_dentist_id: dentistId,
      p_treatment_id: treatment.id,
      p_starts_at: slot.start.toISOString(),
      p_patient_name: patient.fullName,
      p_patient_email: patient.email,
      p_patient_phone: patient.phone,
      p_payment_method: patient.paymentMethod,
      p_manage_token_hash: hash,
      p_insurance_provider: patient.insuranceProvider,
      p_patient_notes: patient.notes,
    })

    if (!error) {
      after(() => sendAppointmentNotice(appointmentId, 'confirmation'))
      return { ok: true, token }
    }

    const reason = raisedReason(error)
    if (isExclusionViolation(error) || (reason && RETRYABLE_REASONS.has(reason))) continue

    console.error(`book_appointment failed: ${error.code} ${error.message}`)
    return { ok: false, reason: 'unexpected' }
  }

  return { ok: false, reason: 'slot_unavailable' }
}

export async function suggestAlternatives(
  request: Pick<BookingRequest, 'slot'>,
  limit = 4,
): Promise<string[]> {
  const [treatments, dentists] = await Promise.all([listTreatments(), listDentists()])
  const treatment = treatments.find((candidate) => candidate.slug === request.slot.treatmentSlug)
  if (!treatment) return []
  const candidates = candidateDentists(treatment, dentists, request.slot.dentistSlug)
  if (candidates.length === 0) return []

  const context = await loadAvailabilityContext(treatment, candidates)
  const requested = request.slot.startsAt.getTime()
  const suggestions: string[] = []
  let date = toLocalDate(request.slot.startsAt, clinicPolicy.timeZone)
  for (let checked = 0; suggestions.length < limit && checked < 14; checked += 1) {
    for (const slot of computeDailySlots(date, context)) {
      if (slot.start.getTime() <= requested && checked === 0) continue
      suggestions.push(slot.start.toISOString())
      if (suggestions.length === limit) break
    }
    date = addDays(date, 1)
  }
  return suggestions
}
