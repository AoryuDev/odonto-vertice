import type { Metadata } from 'next'
import { BookingShell } from '@/components/booking/booking-shell'
import { TreatmentStep } from '@/components/booking/treatment-step'
import { listTreatments } from '@/modules/catalog/catalog.repository'

export const metadata: Metadata = {
  title: 'Agendar consulta',
  description:
    'Escolha o tratamento, o dentista e um horário livre. Confirmação imediata por e-mail, com link para remarcar ou cancelar.',
  alternates: { canonical: '/agendar' },
}

export default async function BookingTreatmentPage() {
  const treatments = await listTreatments()
  return (
    <BookingShell step="treatment">
      <TreatmentStep treatments={treatments} />
    </BookingShell>
  )
}
