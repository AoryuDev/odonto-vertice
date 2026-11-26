import type { AppLocale } from '@/i18n/routing'
import { localizedUrl } from '@/i18n/seo'
import { siteUrl } from '@/lib/site'
import { SCHEMA_ORG_WEEKDAYS, type OpeningHours } from '@/modules/schedule/domain/opening-hours'
import { clinic } from './clinic'
import type { Dentist, Treatment } from './types'

const CLINIC_ID = `${siteUrl}/#clinic`

export type StructuredDataText = {
  readonly paymentAccepted: string
  readonly jobTitle: (dentist: Dentist) => string
}

export function dentistOrganizationSchema(input: {
  hours: readonly OpeningHours[]
  dentists: readonly Dentist[]
  imageUrl: string
  locale: AppLocale
  text: StructuredDataText
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': CLINIC_ID,
    name: clinic.name,
    url: localizedUrl('/', input.locale),
    image: input.imageUrl,
    email: clinic.email,
    currenciesAccepted: 'BRL',
    paymentAccepted: input.text.paymentAccepted,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.address.street,
      addressLocality: clinic.address.city,
      addressRegion: clinic.address.state,
      postalCode: clinic.address.postalCode,
      addressCountry: clinic.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: clinic.geo.latitude,
      longitude: clinic.geo.longitude,
    },
    areaServed: { '@type': 'City', name: clinic.address.city },
    openingHoursSpecification: input.hours.map((entry) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${SCHEMA_ORG_WEEKDAYS[entry.weekday]}`,
      opens: entry.opensAt,
      closes: entry.closesAt,
    })),
    medicalSpecialty: ['Dentistry'],
    employee: input.dentists.map((dentist) => ({
      '@type': 'Person',
      name: dentist.fullName,
      jobTitle: input.text.jobTitle(dentist),
      url: localizedUrl(`/equipe/${dentist.slug}`, input.locale),
    })),
  }
}

export function breadcrumbSchema(
  items: readonly { name: string; path: string }[],
  locale: AppLocale,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: localizedUrl(item.path, locale),
    })),
  }
}

export function treatmentSchema(treatment: Treatment, imageUrl: string, locale: AppLocale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: treatment.name,
    description: treatment.summary,
    url: localizedUrl(`/tratamentos/${treatment.slug}`, locale),
    image: imageUrl,
    procedureType: 'https://schema.org/NoninvasiveProcedure',
    provider: { '@id': CLINIC_ID },
  }
}

export function dentistPersonSchema(
  dentist: Dentist,
  imageUrl: string,
  locale: AppLocale,
  text: StructuredDataText,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: dentist.fullName,
    jobTitle: text.jobTitle(dentist),
    description: dentist.headline,
    image: imageUrl,
    url: localizedUrl(`/equipe/${dentist.slug}`, locale),
    identifier: dentist.croRegistration,
    worksFor: { '@id': CLINIC_ID },
  }
}
