import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { choiceLinks } from '@/components/booking/booking-links'
import { BookingShell } from '@/components/booking/booking-shell'
import { BookingSummary } from '@/components/booking/booking-summary'
import { PatientForm } from '@/components/booking/patient-form'
import { SlotPicker } from '@/components/booking/slot-picker'
import { StepHeading } from '@/components/booking/step-heading'
import { AlertIcon } from '@/components/ui/icons'
import { ClientMessages } from '@/i18n/client-messages'
import { currentLocale } from '@/i18n/server'
import { formatList, formatLongDate, formatTime } from '@/lib/format'
import {
  bookingHref,
  isDentistParam,
  isTreatmentParam,
  parseStartParam,
} from '@/modules/booking/booking-routes'
import {
  bookingParams,
  loadSlotDetails,
  resolveBookingChoice,
  type BookingChoice,
} from '@/modules/booking/booking-view'
import { ANY_DENTIST } from '@/modules/booking/schemas'

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('booking.meta')
  return { title: t('detailsTitle'), robots: { index: false, follow: true } }
}

type Params = { tratamento: string; dentista: string }
type Props = {
  params: Promise<Params>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateStaticParams() {
  return bookingParams()
}

export default async function BookingDetailsPage({ params, searchParams }: Props) {
  const { tratamento, dentista } = await params
  const choice =
    isTreatmentParam(tratamento) && isDentistParam(dentista)
      ? await resolveBookingChoice(tratamento, dentista)
      : undefined
  if (!choice) notFound()
  const tStepper = await getTranslations('booking.stepper')

  return (
    <BookingShell step="details" completed={choiceLinks(choice, tStepper('anyDentist'))}>
      <Suspense fallback={<DetailsSkeleton />}>
        <DetailsContent choice={choice} searchParams={searchParams} />
      </Suspense>
    </BookingShell>
  )
}

async function DetailsContent({
  choice,
  searchParams,
}: {
  choice: BookingChoice
  searchParams: Props['searchParams']
}) {
  const locale = await currentLocale()
  const t = await getTranslations({ locale, namespace: 'booking.details' })
  const start = parseStartParam((await searchParams).horario)
  const base = { treatment: choice.treatment.slug, dentist: choice.dentistSlug }
  if (!start) {
    return (
      <p className="max-w-2xl text-ink-soft">
        {t('chooseFirst')}{' '}
        <Link
          href={bookingHref(base)}
          className="font-medium text-pine-800 underline underline-offset-4"
        >
          {t('seeTimes')}
        </Link>
      </p>
    )
  }

  const { slot, board } = await loadSlotDetails(choice, start)
  if (!slot) {
    return (
      <>
        <div
          role="alert"
          className="flex max-w-2xl items-start gap-3 rounded-[var(--radius-soft)] border border-clay-500/40 bg-clay-100 p-4"
        >
          <AlertIcon size={20} className="mt-0.5 shrink-0 text-clay-700" />
          <p>
            {t('taken', {
              time: formatTime(new Date(start), locale),
              date: formatLongDate(new Date(start), locale),
            })}
          </p>
        </div>
        <SlotPicker
          board={board}
          showDentists={choice.dentistSlug === ANY_DENTIST}
          hrefForDate={(date) => bookingHref({ ...base, date })}
          hrefForSlot={(candidate) => bookingHref({ ...base, start: candidate.start })}
        />
      </>
    )
  }

  const names = slot.dentistNames
  const dentistLabel =
    choice.dentist?.displayName ??
    (names.length === 1
      ? (names[0] ?? '')
      : t('assignedOnConfirm', { names: formatList(names, locale, 'disjunction') }))

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
      <div className="order-2 lg:order-1">
        <StepHeading title={t('title')}>{t('body')}</StepHeading>
        <div className="mt-8">
          <ClientMessages namespaces={['booking', 'validation', 'field']}>
            <PatientForm
              treatmentSlug={choice.treatment.slug}
              dentistSlug={choice.dentistSlug}
              startsAt={slot.start}
            />
          </ClientMessages>
        </div>
      </div>
      <aside className="order-1 lg:order-2 lg:pt-2">
        <h2 className="sr-only">{t('summary')}</h2>
        <div className="lg:sticky lg:top-8">
          <BookingSummary
            treatmentName={choice.treatment.name}
            durationMinutes={choice.treatment.durationMinutes}
            dentistLabel={dentistLabel}
            startsAt={new Date(slot.start)}
          />
          <Link
            href={bookingHref({ ...base, date: board.selectedDate })}
            className="mt-3 inline-block text-sm text-pine-800 underline underline-offset-4"
          >
            {t('changeTime')}
          </Link>
        </div>
      </aside>
    </div>
  )
}

function DetailsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid animate-pulse gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]"
    >
      <div className="space-y-4">
        <div className="h-12 w-56 rounded bg-paper-deep" />
        <div className="h-5 w-80 max-w-full rounded bg-paper-deep" />
        <div className="h-14 rounded bg-paper-deep" />
        <div className="h-14 rounded bg-paper-deep" />
      </div>
      <div className="h-72 rounded-[var(--radius-card)] bg-paper-deep" />
    </div>
  )
}
