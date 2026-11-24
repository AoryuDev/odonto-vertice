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
import type { BookingSelection } from './search-params'

export type SlotChoice = {
  readonly start: string
  readonly dentistNames: readonly string[]
}

export type SlotBoard = {
  readonly days: readonly DaySummary[]
  readonly selectedDate: LocalDate | undefined
  readonly slots: readonly SlotChoice[]
}

export type BookingView =
  | { readonly step: 'treatment'; readonly treatments: readonly Treatment[] }
  | {
      readonly step: 'dentist'
      readonly treatment: Treatment
      readonly dentists: readonly Dentist[]
    }
  | {
      readonly step: 'slot'
      readonly treatment: Treatment
      readonly dentistSlug: string
      readonly dentist: Dentist | undefined
      readonly board: SlotBoard
    }
  | {
      readonly step: 'details'
      readonly treatment: Treatment
      readonly dentistSlug: string
      readonly dentist: Dentist | undefined
      readonly slot: SlotChoice | undefined
      readonly requestedStart: string
      readonly board: SlotBoard
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

export async function loadBookingView(selection: BookingSelection): Promise<BookingView> {
  const [treatments, dentists] = await Promise.all([listTreatments(), listDentists()])
  const treatment = treatments.find((candidate) => candidate.slug === selection.treatment)
  if (!treatment) return { step: 'treatment', treatments }

  const offering = candidateDentists(treatment, dentists, ANY_DENTIST)
  const dentistSlug =
    selection.dentist === ANY_DENTIST ||
    offering.some((dentist) => dentist.slug === selection.dentist)
      ? selection.dentist
      : undefined
  if (!dentistSlug) return { step: 'dentist', treatment, dentists: offering }

  const chosen = candidateDentists(treatment, dentists, dentistSlug)
  const dentist = dentistSlug === ANY_DENTIST ? undefined : chosen[0]
  const context = await loadAvailabilityContext(treatment, chosen)

  if (!selection.start) {
    return {
      step: 'slot',
      treatment,
      dentistSlug,
      dentist,
      board: buildSlotBoard(context, chosen, selection.date),
    }
  }

  const start = new Date(selection.start)
  const date = toLocalDate(start, context.policy.timeZone)
  const slot = findSlot(date, start, context)
  return {
    step: 'details',
    treatment,
    dentistSlug,
    dentist,
    slot: slot ? toChoice(slot, chosen) : undefined,
    requestedStart: selection.start,
    board: buildSlotBoard(context, chosen, date),
  }
}
