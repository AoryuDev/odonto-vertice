import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/clients'
import { parseLocalTime } from '@/modules/schedule/domain/clinic-time'
import { clinicOpeningHours, type OpeningHours } from '@/modules/schedule/domain/opening-hours'
import { treatmentContentSchema, type Dentist, type Treatment } from './types'

export const CATALOG_TAG = 'catalog'

const TREATMENT_COLUMNS =
  'id, slug, name, duration_minutes, summary, content, photo_key, is_urgent, dentist_treatments(dentist_id)'

const DENTIST_COLUMNS =
  'id, slug, full_name, display_name, specialty, cro_registration, headline, bio, education, photo_key, is_technical_lead, dentist_treatments(treatment_id), weekly_schedules(weekday, starts_at, ends_at, lunch_starts_at, lunch_ends_at)'

export async function listTreatments(): Promise<Treatment[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CATALOG_TAG)

  const { data, error } = await createPublicClient()
    .from('treatments')
    .select(TREATMENT_COLUMNS)
    .eq('is_bookable', true)
    .order('sort_order')
  if (error) throw new Error(`Failed to load treatments: ${error.message}`)

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    durationMinutes: row.duration_minutes,
    summary: row.summary,
    content: treatmentContentSchema.parse(row.content),
    photoKey: row.photo_key,
    isUrgent: row.is_urgent,
    dentistIds: row.dentist_treatments.map((link) => link.dentist_id),
  }))
}

export async function listDentists(): Promise<Dentist[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CATALOG_TAG)

  const { data, error } = await createPublicClient()
    .from('dentists')
    .select(DENTIST_COLUMNS)
    .order('sort_order')
  if (error) throw new Error(`Failed to load dentists: ${error.message}`)

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    fullName: row.full_name,
    displayName: row.display_name,
    specialty: row.specialty,
    croRegistration: row.cro_registration,
    headline: row.headline,
    bio: row.bio,
    education: row.education,
    photoKey: row.photo_key,
    isTechnicalLead: row.is_technical_lead,
    treatmentIds: row.dentist_treatments.map((link) => link.treatment_id),
    schedules: row.weekly_schedules
      .map((schedule) => ({
        dentistId: row.id,
        weekday: schedule.weekday,
        startsAt: parseLocalTime(schedule.starts_at),
        endsAt: parseLocalTime(schedule.ends_at),
        lunch:
          schedule.lunch_starts_at && schedule.lunch_ends_at
            ? {
                startsAt: parseLocalTime(schedule.lunch_starts_at),
                endsAt: parseLocalTime(schedule.lunch_ends_at),
              }
            : null,
      }))
      .sort((left, right) => left.weekday - right.weekday),
  }))
}

export async function findTreatment(slug: string): Promise<Treatment | undefined> {
  return (await listTreatments()).find((treatment) => treatment.slug === slug)
}

export async function findDentist(slug: string): Promise<Dentist | undefined> {
  return (await listDentists()).find((dentist) => dentist.slug === slug)
}

export async function technicalLead(): Promise<Dentist> {
  const lead = (await listDentists()).find((dentist) => dentist.isTechnicalLead)
  if (!lead) throw new Error('The clinic must have a technical lead dentist')
  return lead
}

export async function openingHours(): Promise<OpeningHours[]> {
  return clinicOpeningHours((await listDentists()).flatMap((dentist) => dentist.schedules))
}
