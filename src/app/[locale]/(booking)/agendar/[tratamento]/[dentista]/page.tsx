import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { choiceLinks } from '@/components/booking/booking-links'
import { BookingShell } from '@/components/booking/booking-shell'
import { SlotPicker, SlotPickerSkeleton } from '@/components/booking/slot-picker'
import { StepHeading } from '@/components/booking/step-heading'
import {
  bookingHref,
  isDentistParam,
  isTreatmentParam,
  parseDateParam,
} from '@/modules/booking/booking-routes'
import {
  bookingParams,
  loadSlotBoard,
  resolveBookingChoice,
  type BookingChoice,
} from '@/modules/booking/booking-view'
import { ANY_DENTIST } from '@/modules/booking/schemas'

export const instant = false

type Params = { tratamento: string; dentista: string }
type Props = {
  params: Promise<Params>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateStaticParams() {
  return bookingParams()
}

async function resolve(params: Promise<Params>): Promise<BookingChoice | undefined> {
  const { tratamento, dentista } = await params
  if (!isTreatmentParam(tratamento) || !isDentistParam(dentista)) return undefined
  return resolveBookingChoice(tratamento, dentista)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const choice = await resolve(params)
  return choice
    ? {
        title: `${choice.treatment.name}: horários livres`,
        alternates: {
          canonical: bookingHref({ treatment: choice.treatment.slug, dentist: choice.dentistSlug }),
        },
      }
    : {}
}

export default async function BookingSlotPage({ params, searchParams }: Props) {
  const choice = await resolve(params)
  if (!choice) notFound()

  return (
    <BookingShell step="slot" completed={choiceLinks(choice)}>
      <StepHeading title="Escolha o dia e o horário">
        Mostramos só o que está livre na agenda
        {choice.dentist
          ? ` de ${choice.dentist.displayName}`
          : ' dos dentistas que atendem este tratamento'}
        .
      </StepHeading>
      <Suspense fallback={<SlotPickerSkeleton />}>
        <SlotBoardSection choice={choice} searchParams={searchParams} />
      </Suspense>
    </BookingShell>
  )
}

async function SlotBoardSection({
  choice,
  searchParams,
}: {
  choice: BookingChoice
  searchParams: Props['searchParams']
}) {
  const board = await loadSlotBoard(choice, parseDateParam((await searchParams).data))
  const base = { treatment: choice.treatment.slug, dentist: choice.dentistSlug }
  return (
    <SlotPicker
      board={board}
      showDentists={choice.dentistSlug === ANY_DENTIST}
      hrefForDate={(date) => bookingHref({ ...base, date })}
      hrefForSlot={(slot) => bookingHref({ ...base, start: slot.start })}
    />
  )
}
