import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { routing, type AppLocale } from '@/i18n/routing'
import { pickTranslation, translationLocales } from '@/i18n/translations'
import { createPublicClient } from '@/lib/supabase/clients'
import { parseLocalTime } from '@/modules/schedule/domain/clinic-time'
import { clinicOpeningHours, type OpeningHours } from '@/modules/schedule/domain/opening-hours'
import { treatmentContentSchema, type Dentist, type Treatment } from './types'

export const CATALOG_TAG = 'catalog'

const TREATMENT_COLUMNS =
  'id, slug, duration_minutes, photo_key, is_urgent, dentist_treatments(dentist_id), treatment_translations(locale, name, summary, content)'

const DENTIST_COLUMNS =
  'id, slug, full_name, specialty, cro_registration, photo_key, is_technical_lead, dentist_treatments(treatment_id), weekly_schedules(weekday, starts_at, ends_at, lunch_starts_at, lunch_ends_at), dentist_translations(locale, display_name, headline, bio, education)'

function missingTranslation(kind: string, slug: string): never {
  throw new Error(`The ${kind} "${slug}" has no translation in the default language`)
}

export async function listTreatments(locale: AppLocale): Promise<Treatment[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CATALOG_TAG)

  const { data, error } = await createPublicClient()
    .from('treatments')
    .select(TREATMENT_COLUMNS)
    .eq('is_bookable', true)
    .in('treatment_translations.locale', translationLocales(locale))
    .order('sort_order')
  if (error) throw new Error(`Failed to load treatments: ${error.message}`)

  return data.map((row) => {
    const text =
      pickTranslation(row.treatment_translations, locale) ??
      missingTranslation('treatment', row.slug)
    return {
      id: row.id,
      slug: row.slug,
      name: text.name,
      durationMinutes: row.duration_minutes,
      summary: text.summary,
      content: treatmentContentSchema.parse(text.content),
      photoKey: row.photo_key,
      isUrgent: row.is_urgent,
      dentistIds: row.dentist_treatments.map((link) => link.dentist_id),
    }
  })
}

export async function listDentists(locale: AppLocale): Promise<Dentist[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CATALOG_TAG)

  const { data, error } = await createPublicClient()
    .from('dentists')
    .select(DENTIST_COLUMNS)
    .in('dentist_translations.locale', translationLocales(locale))
    .order('sort_order')
  if (error) throw new Error(`Failed to load dentists: ${error.message}`)

  return data.map((row) => {
    const text =
      pickTranslation(row.dentist_translations, locale) ?? missingTranslation('dentist', row.slug)
    return {
      id: row.id,
      slug: row.slug,
      fullName: row.full_name,
      displayName: text.display_name,
      specialty: row.specialty,
      croRegistration: row.cro_registration,
      headline: text.headline,
      bio: text.bio,
      education: text.education,
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
    }
  })
}

export async function findTreatment(
  slug: string,
  locale: AppLocale,
): Promise<Treatment | undefined> {
  return (await listTreatments(locale)).find((treatment) => treatment.slug === slug)
}

export async function findDentist(slug: string, locale: AppLocale): Promise<Dentist | undefined> {
  return (await listDentists(locale)).find((dentist) => dentist.slug === slug)
}

export async function technicalLead(locale: AppLocale): Promise<Dentist> {
  const lead = (await listDentists(locale)).find((dentist) => dentist.isTechnicalLead)
  if (!lead) throw new Error('The clinic must have a technical lead dentist')
  return lead
}

export async function openingHours(): Promise<OpeningHours[]> {
  return clinicOpeningHours(
    (await listDentists(routing.defaultLocale)).flatMap((dentist) => dentist.schedules),
  )
}
