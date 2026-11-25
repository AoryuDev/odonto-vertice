import 'server-only'
import { getTranslations } from 'next-intl/server'
import type { StructuredDataText } from '@/modules/catalog/structured-data'
import type { AppLocale } from './routing'

export async function getStructuredDataText(locale: AppLocale): Promise<StructuredDataText> {
  const [t, tSpecialty] = await Promise.all([
    getTranslations({ locale, namespace: 'seo' }),
    getTranslations({ locale, namespace: 'specialty' }),
  ])
  return {
    paymentAccepted: t('paymentAccepted'),
    jobTitle: (dentist) =>
      t(dentist.displayName.startsWith('Dra.') ? 'jobTitleFemale' : 'jobTitleMale', {
        specialty: tSpecialty(dentist.specialty),
      }),
  }
}
