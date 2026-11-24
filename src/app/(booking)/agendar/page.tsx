import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BookingSummary } from '@/components/booking/booking-summary'
import { DentistStep } from '@/components/booking/dentist-step'
import { PatientForm } from '@/components/booking/patient-form'
import { SlotPicker } from '@/components/booking/slot-picker'
import { StepHeading } from '@/components/booking/step-heading'
import { Stepper, type StepLink } from '@/components/booking/stepper'
import { StepTransition } from '@/components/booking/step-transition'
import { TreatmentStep } from '@/components/booking/treatment-step'
import { AlertIcon } from '@/components/ui/icons'
import { formatLongDate, formatShortDate, formatTime } from '@/lib/format'
import { loadBookingView, type BookingView } from '@/modules/booking/booking-view'
import { ANY_DENTIST } from '@/modules/booking/schemas'
import { bookingHref, parseBookingSearch } from '@/modules/booking/search-params'

export const metadata: Metadata = {
  title: 'Agendar consulta',
  description:
    'Escolha o tratamento, o dentista e um horário livre. Confirmação imediata por e-mail, com link para remarcar ou cancelar.',
  alternates: { canonical: '/agendar' },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default function BookingPage({ searchParams }: Props) {
  return (
    <div className="container-page py-8 md:py-14">
      <Suspense fallback={<BookingSkeleton />}>
        <BookingFlow searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function completedSteps(view: BookingView): StepLink[] {
  if (view.step === 'treatment') return []
  const links: StepLink[] = [
    { step: 'treatment', href: bookingHref({}), value: view.treatment.name },
  ]
  if (view.step === 'dentist') return links
  links.push({
    step: 'dentist',
    href: bookingHref({ treatment: view.treatment.slug }),
    value: view.dentist?.displayName ?? 'Qualquer dentista',
  })
  if (view.step === 'details' && view.slot) {
    const start = new Date(view.slot.start)
    links.push({
      step: 'slot',
      href: bookingHref({
        treatment: view.treatment.slug,
        dentist: view.dentistSlug,
        date: view.board.selectedDate,
      }),
      value: `${formatShortDate(start)} às ${formatTime(start)}`,
    })
  }
  return links
}

async function BookingFlow({ searchParams }: Props) {
  const selection = parseBookingSearch(await searchParams)
  const view = await loadBookingView(selection)

  return (
    <>
      <Stepper current={view.step} completed={completedSteps(view)} />
      <div className="mt-10">
        <StepTransition stepKey={view.step}>
          <StepContent view={view} />
        </StepTransition>
      </div>
    </>
  )
}

function StepContent({ view }: { view: BookingView }) {
  switch (view.step) {
    case 'treatment':
      return <TreatmentStep treatments={view.treatments} />
    case 'dentist':
      return <DentistStep treatment={view.treatment} dentists={view.dentists} />
    case 'slot':
      return (
        <>
          <StepHeading title="Escolha o dia e o horário">
            Mostramos só o que está livre na agenda
            {view.dentist
              ? ` de ${view.dentist.displayName}`
              : ' dos dentistas que atendem este tratamento'}
            .
          </StepHeading>
          <SlotPicker
            board={view.board}
            showDentists={view.dentistSlug === ANY_DENTIST}
            hrefForDate={(date) =>
              bookingHref({ treatment: view.treatment.slug, dentist: view.dentistSlug, date })
            }
            hrefForSlot={(slot) =>
              bookingHref({
                treatment: view.treatment.slug,
                dentist: view.dentistSlug,
                date: view.board.selectedDate,
                start: slot.start,
              })
            }
          />
        </>
      )
    case 'details':
      return <DetailsStep view={view} />
  }
}

function DetailsStep({ view }: { view: Extract<BookingView, { step: 'details' }> }) {
  if (!view.slot) {
    return (
      <>
        <div
          role="alert"
          className="flex max-w-2xl items-start gap-3 rounded-[var(--radius-soft)] border border-clay-500/40 bg-clay-100 p-4"
        >
          <AlertIcon size={20} className="mt-0.5 shrink-0 text-clay-700" />
          <p>
            O horário das {formatTime(new Date(view.requestedStart))} de{' '}
            {formatLongDate(new Date(view.requestedStart))} não está mais livre. Escolha outro:
          </p>
        </div>
        <SlotPicker
          board={view.board}
          showDentists={view.dentistSlug === ANY_DENTIST}
          hrefForDate={(date) =>
            bookingHref({ treatment: view.treatment.slug, dentist: view.dentistSlug, date })
          }
          hrefForSlot={(slot) =>
            bookingHref({
              treatment: view.treatment.slug,
              dentist: view.dentistSlug,
              date: view.board.selectedDate,
              start: slot.start,
            })
          }
        />
      </>
    )
  }

  const names = view.slot.dentistNames
  const dentistLabel =
    view.dentist?.displayName ??
    (names.length === 1 ? (names[0] ?? '') : `${names.join(' ou ')} (definimos ao confirmar)`)

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
      <div className="order-2 lg:order-1">
        <StepHeading title="Seus dados">
          Usamos só para confirmar a consulta e enviar o lembrete na véspera.
        </StepHeading>
        <div className="mt-8">
          <PatientForm
            treatmentSlug={view.treatment.slug}
            dentistSlug={view.dentistSlug}
            startsAt={view.slot.start}
          />
        </div>
      </div>
      <aside className="order-1 lg:order-2 lg:pt-2">
        <h2 className="sr-only">Resumo do agendamento</h2>
        <div className="lg:sticky lg:top-8">
          <BookingSummary
            treatmentName={view.treatment.name}
            durationMinutes={view.treatment.durationMinutes}
            dentistLabel={dentistLabel}
            startsAt={new Date(view.slot.start)}
          />
        </div>
      </aside>
    </div>
  )
}

function BookingSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="h-1 flex-1 rounded-full bg-line" />
        ))}
      </div>
      <div className="mt-12 h-12 w-2/3 max-w-lg rounded bg-paper-deep" />
      <div className="mt-4 h-5 w-1/2 max-w-md rounded bg-paper-deep" />
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className="h-24 rounded-[var(--radius-soft)] bg-paper-deep" />
        ))}
      </div>
    </div>
  )
}
