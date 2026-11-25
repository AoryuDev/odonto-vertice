import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
import { currentLocale } from '@/i18n/server'
import { localizedAlternates } from '@/i18n/seo'

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
  return resolveBookingChoice(tratamento, dentista, await currentLocale())
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await currentLocale()
  const [choice, t] = await Promise.all([
    resolve(params),
    getTranslations({ locale, namespace: 'booking.meta' }),
  ])
  return choice
    ? {
        title: t('slotsTitle', { treatment: choice.treatment.name }),
        alternates: localizedAlternates(
          bookingHref({ treatment: choice.treatment.slug, dentist: choice.dentistSlug }),
          locale,
        ),
      }
    : {}
}

export default async function BookingSlotPage({ params, searchParams }: Props) {
  const [choice, t, tStepper] = await Promise.all([
    resolve(params),
    getTranslations('booking.slotStep'),
    getTranslations('booking.stepper'),
  ])
  if (!choice) notFound()

  return (
    <BookingShell step="slot" completed={choiceLinks(choice, tStepper('anyDentist'))}>
      <StepHeading title={t('title')}>
        {choice.dentist ? t('bodyDentist', { dentist: choice.dentist.displayName }) : t('bodyAny')}
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
