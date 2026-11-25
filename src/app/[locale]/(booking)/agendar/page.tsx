import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BookingShell } from '@/components/booking/booking-shell'
import { TreatmentStep } from '@/components/booking/treatment-step'
import { listTreatments } from '@/modules/catalog/catalog.repository'
import { currentLocale } from '@/i18n/server'
import { localizedAlternates } from '@/i18n/seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale()
  const t = await getTranslations({ locale, namespace: 'booking.meta' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates('/agendar', locale),
  }
}

export default async function BookingTreatmentPage() {
  const treatments = await listTreatments(await currentLocale())
  return (
    <BookingShell step="treatment">
      <TreatmentStep treatments={treatments} />
    </BookingShell>
  )
}
