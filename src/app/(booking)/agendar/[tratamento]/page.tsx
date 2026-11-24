import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookingShell } from '@/components/booking/booking-shell'
import { DentistStep } from '@/components/booking/dentist-step'
import { bookingHref, isTreatmentParam } from '@/modules/booking/booking-routes'
import { findTreatmentWithDentists } from '@/modules/booking/booking-view'
import { listTreatments } from '@/modules/catalog/catalog.repository'

export const instant = false

type Props = { params: Promise<{ tratamento: string }> }

export async function generateStaticParams() {
  return (await listTreatments()).map((treatment) => ({ tratamento: treatment.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tratamento } = await params
  const found = isTreatmentParam(tratamento)
    ? await findTreatmentWithDentists(tratamento)
    : undefined
  return found
    ? {
        title: `Agendar ${found.treatment.name.toLowerCase()}`,
        alternates: { canonical: bookingHref({ treatment: found.treatment.slug }) },
      }
    : {}
}

export default async function BookingDentistPage({ params }: Props) {
  const { tratamento } = await params
  const found = isTreatmentParam(tratamento)
    ? await findTreatmentWithDentists(tratamento)
    : undefined
  if (!found) notFound()

  return (
    <BookingShell
      step="dentist"
      completed={[{ step: 'treatment', href: bookingHref({}), value: found.treatment.name }]}
    >
      <DentistStep treatment={found.treatment} dentists={found.dentists} />
    </BookingShell>
  )
}
