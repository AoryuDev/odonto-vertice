import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { choiceLinks } from '@/components/booking/booking-links'
import { BookingShell } from '@/components/booking/booking-shell'
import { BookingSummary } from '@/components/booking/booking-summary'
import { PatientForm } from '@/components/booking/patient-form'
import { SlotPicker } from '@/components/booking/slot-picker'
import { StepHeading } from '@/components/booking/step-heading'
import { AlertIcon } from '@/components/ui/icons'
import { formatLongDate, formatTime } from '@/lib/format'
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

export const metadata: Metadata = {
  title: 'Seus dados',
  robots: { index: false, follow: true },
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

  return (
    <BookingShell step="details" completed={choiceLinks(choice)}>
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
  const start = parseStartParam((await searchParams).horario)
  const base = { treatment: choice.treatment.slug, dentist: choice.dentistSlug }
  if (!start) {
    return (
      <p className="max-w-2xl text-ink-soft">
        Escolha primeiro um horário.{' '}
        <Link
          href={bookingHref(base)}
          className="font-medium text-pine-800 underline underline-offset-4"
        >
          Ver horários livres
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
            O horário das {formatTime(new Date(start))} de {formatLongDate(new Date(start))} não
            está mais livre. Escolha outro:
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
    (names.length === 1 ? (names[0] ?? '') : `${names.join(' ou ')} (definimos ao confirmar)`)

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
      <div className="order-2 lg:order-1">
        <StepHeading title="Seus dados">
          Usamos só para confirmar a consulta e enviar o lembrete na véspera.
        </StepHeading>
        <div className="mt-8">
          <PatientForm
            treatmentSlug={choice.treatment.slug}
            dentistSlug={choice.dentistSlug}
            startsAt={slot.start}
          />
        </div>
      </div>
      <aside className="order-1 lg:order-2 lg:pt-2">
        <h2 className="sr-only">Resumo do agendamento</h2>
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
            Alterar horário
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
