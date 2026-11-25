import 'server-only'
import type { AppLocale } from '@/i18n/routing'
import { listDentists, listTreatments } from '@/modules/catalog/catalog.repository'
import { loadAvailabilityContext } from './availability.service'
import { bookableDateRange, computeDailySlots, type Slot } from './domain/availability'
import { addDays, compareLocalDates, type LocalDate } from './domain/clinic-time'

export type NextSlot = {
  readonly date: LocalDate
  readonly slot: Slot
  readonly dentistNames: readonly string[]
  readonly treatmentSlug: string
  readonly isToday: boolean
  readonly isTomorrow: boolean
}

export async function findNextSlot(
  treatmentSlug: string,
  locale: AppLocale,
): Promise<NextSlot | undefined> {
  const [treatments, dentists] = await Promise.all([listTreatments(locale), listDentists(locale)])
  const treatment = treatments.find((candidate) => candidate.slug === treatmentSlug)
  if (!treatment) return undefined

  const candidates = dentists.filter((dentist) => treatment.dentistIds.includes(dentist.id))
  const context = await loadAvailabilityContext(treatment, candidates)
  const { first, last } = bookableDateRange(context.now, context.policy)

  let date = first
  while (compareLocalDates(date, last) <= 0) {
    const [slot] = computeDailySlots(date, context)
    if (!slot) {
      date = addDays(date, 1)
      continue
    }
    return {
      date,
      slot,
      dentistNames: candidates
        .filter((dentist) => slot.dentistIds.includes(dentist.id))
        .map((dentist) => dentist.displayName),
      treatmentSlug,
      isToday: date === first,
      isTomorrow: date === addDays(first, 1),
    }
  }
  return undefined
}
