import 'server-only'
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

export async function findNextSlot(treatmentSlug: string): Promise<NextSlot | undefined> {
  const [treatments, dentists] = await Promise.all([listTreatments(), listDentists()])
  const treatment = treatments.find((candidate) => candidate.slug === treatmentSlug)
  if (!treatment) return undefined

  const candidates = dentists.filter((dentist) => treatment.dentistIds.includes(dentist.id))
  const context = await loadAvailabilityContext(treatment, candidates)
  const { first, last } = bookableDateRange(context.now, context.policy)

  for (let date = first; compareLocalDates(date, last) <= 0; date = addDays(date, 1)) {
    const [slot] = computeDailySlots(date, context)
    if (!slot) continue
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
