import { absoluteUrl, siteUrl } from '@/lib/site'
import { SCHEMA_ORG_WEEKDAYS, type OpeningHours } from '@/modules/schedule/domain/opening-hours'
import { clinic } from './clinic'
import { SPECIALTY_LABELS, type Dentist, type Treatment } from './types'

const CLINIC_ID = `${siteUrl}/#clinic`

function jobTitle(dentist: Dentist): string {
  const title = dentist.displayName.startsWith('Dra.') ? 'Cirurgiã-dentista' : 'Cirurgião-dentista'
  return `${title} — ${SPECIALTY_LABELS[dentist.specialty]}`
}

export function dentistOrganizationSchema(input: {
  hours: readonly OpeningHours[]
  dentists: readonly Dentist[]
  imageUrl: string
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': CLINIC_ID,
    name: clinic.name,
    url: siteUrl,
    image: input.imageUrl,
    telephone: clinic.phone.e164,
    email: clinic.email,
    currenciesAccepted: 'BRL',
    paymentAccepted: 'Particular, convênios odontológicos',
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
    areaServed: { '@type': 'City', name: 'Goiânia' },
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
      jobTitle: jobTitle(dentist),
      url: absoluteUrl(`/equipe/${dentist.slug}`),
    })),
  }
}

export function breadcrumbSchema(items: readonly { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function treatmentSchema(treatment: Treatment, imageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: treatment.name,
    description: treatment.summary,
    url: absoluteUrl(`/tratamentos/${treatment.slug}`),
    image: imageUrl,
    procedureType: 'https://schema.org/NoninvasiveProcedure',
    provider: { '@id': CLINIC_ID },
  }
}

export function dentistPersonSchema(dentist: Dentist, imageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: dentist.fullName,
    jobTitle: jobTitle(dentist),
    description: dentist.headline,
    image: imageUrl,
    url: absoluteUrl(`/equipe/${dentist.slug}`),
    identifier: dentist.croRegistration,
    worksFor: { '@id': CLINIC_ID },
  }
}
