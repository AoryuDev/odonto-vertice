import 'server-only'
import { listDentists, listTreatments } from '@/modules/catalog/catalog.repository'
import type { Dentist, Treatment } from '@/modules/catalog/types'
import { loadAvailabilityContext } from '@/modules/schedule/availability.service'
import {
  computeDailySlots,
  findSlot,
  summarizeDays,
  type AvailabilityContext,
  type DaySummary,
  type Slot,
} from '@/modules/schedule/domain/availability'
import { toLocalDate, type LocalDate } from '@/modules/schedule/domain/clinic-time'
import { candidateDentists } from './booking.service'
import { ANY_DENTIST } from './schemas'

export type SlotChoice = {
  readonly start: string
  readonly dentistNames: readonly string[]
}

export type SlotBoard = {
  readonly days: readonly DaySummary[]
  readonly selectedDate: LocalDate | undefined
  readonly slots: readonly SlotChoice[]
}

export type BookingChoice = {
  readonly treatment: Treatment
  readonly dentistSlug: string
  readonly dentist: Dentist | undefined
  readonly candidates: readonly Dentist[]
}

export function buildSlotBoard(
  context: AvailabilityContext,
  dentists: readonly Dentist[],
  requestedDate: LocalDate | undefined,
): SlotBoard {
  const days = summarizeDays(context)
  const open = days.filter((day) => day.slotCount > 0)
  const selectedDate =
    requestedDate && open.some((day) => day.date === requestedDate) ? requestedDate : open[0]?.date
  const slots = selectedDate ? computeDailySlots(selectedDate, context) : []
  return { days, selectedDate, slots: slots.map((slot) => toChoice(slot, dentists)) }
}

function toChoice(slot: Slot, dentists: readonly Dentist[]): SlotChoice {
  return {
    start: slot.start.toISOString(),
    dentistNames: dentists
      .filter((dentist) => slot.dentistIds.includes(dentist.id))
      .map((dentist) => dentist.displayName),
  }
}

export async function findTreatmentWithDentists(
  treatmentSlug: string,
): Promise<{ treatment: Treatment; dentists: Dentist[] } | undefined> {
  const [treatments, dentists] = await Promise.all([listTreatments(), listDentists()])
  const treatment = treatments.find((candidate) => candidate.slug === treatmentSlug)
  if (!treatment) return undefined
  return { treatment, dentists: candidateDentists(treatment, dentists, ANY_DENTIST) }
}

export async function resolveBookingChoice(
  treatmentSlug: string,
  dentistSlug: string,
): Promise<BookingChoice | undefined> {
  const found = await findTreatmentWithDentists(treatmentSlug)
  if (!found) return undefined
  const candidates =
    dentistSlug === ANY_DENTIST
      ? found.dentists
      : found.dentists.filter((dentist) => dentist.slug === dentistSlug)
  if (candidates.length === 0) return undefined
  return {
    treatment: found.treatment,
    dentistSlug,
    dentist: dentistSlug === ANY_DENTIST ? undefined : candidates[0],
    candidates,
  }
}

export async function bookingParams(): Promise<{ tratamento: string; dentista: string }[]> {
  const [treatments, dentists] = await Promise.all([listTreatments(), listDentists()])
  return treatments.flatMap((treatment) => [
    { tratamento: treatment.slug, dentista: ANY_DENTIST },
    ...candidateDentists(treatment, dentists, ANY_DENTIST).map((dentist) => ({
      tratamento: treatment.slug,
      dentista: dentist.slug,
    })),
  ])
}

export async function loadSlotBoard(
  choice: BookingChoice,
  requestedDate: LocalDate | undefined,
): Promise<SlotBoard> {
  const context = await loadAvailabilityContext(choice.treatment, choice.candidates)
  return buildSlotBoard(context, choice.candidates, requestedDate)
}

export async function loadSlotDetails(
  choice: BookingChoice,
  start: string,
): Promise<{ slot: SlotChoice | undefined; board: SlotBoard }> {
  const context = await loadAvailabilityContext(choice.treatment, choice.candidates)
  const instant = new Date(start)
  const date = toLocalDate(instant, context.policy.timeZone)
  const slot = findSlot(date, instant, context)
  return {
    slot: slot ? toChoice(slot, choice.candidates) : undefined,
    board: buildSlotBoard(context, choice.candidates, date),
  }
}
