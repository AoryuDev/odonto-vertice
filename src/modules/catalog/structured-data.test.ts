import { describe, expect, it } from 'vitest'
import { parseLocalTime } from '@/modules/schedule/domain/clinic-time'
import { clinic, directionsUrl, formatAddressLine, whatsappUrl } from './clinic'
import {
  breadcrumbSchema,
  dentistOrganizationSchema,
  dentistPersonSchema,
  treatmentSchema,
} from './structured-data'
import { treatmentContentSchema, type Dentist, type Treatment } from './types'

const dentist: Dentist = {
  id: 'd1',
  slug: 'helena-prado',
  fullName: 'Helena Prado Sato',
  displayName: 'Dra. Helena Prado',
  specialty: 'general_dentistry',
  croRegistration: 'CRO-GO 11482',
  headline: 'Clínica geral e prevenção.',
  bio: ['Bio'],
  education: [],
  photoKey: 'helena-prado',
  isTechnicalLead: true,
  treatmentIds: ['t1'],
  schedules: [],
}

const treatment: Treatment = {
  id: 't1',
  slug: 'limpeza',
  name: 'Limpeza',
  durationMinutes: 45,
  summary: 'Remoção de tártaro e placa.',
  content: treatmentContentSchema.parse({ intro: ['Texto'] }),
  photoKey: 'limpeza',
  isUrgent: false,
  dentistIds: ['d1'],
}

describe('clinic contact helpers', () => {
  it('formats the address and builds map and WhatsApp links', () => {
    expect(formatAddressLine()).toBe(`${clinic.address.street} — Setor Bueno, Goiânia — GO`)
    expect(directionsUrl()).toBe(
      `https://www.google.com/maps/dir/?api=1&destination=${clinic.geo.latitude},${clinic.geo.longitude}`,
    )
    expect(whatsappUrl()).toBe('https://wa.me/5562994182730')
    expect(whatsappUrl('Olá, tudo bem?')).toBe(
      'https://wa.me/5562994182730?text=Ol%C3%A1%2C%20tudo%20bem%3F',
    )
  })
})

describe('structured data', () => {
  it('describes the clinic as a Dentist with address, geo, hours and staff', () => {
    const schema = dentistOrganizationSchema({
      hours: [{ weekday: 1, opensAt: parseLocalTime('08:00'), closesAt: parseLocalTime('18:30') }],
      dentists: [dentist],
      imageUrl: 'https://example.com/clinic.jpg',
    })

    expect(schema).toMatchObject({
      '@type': 'Dentist',
      name: 'Odonto Vértice',
      address: {
        addressLocality: 'Goiânia',
        addressRegion: 'GO',
        postalCode: clinic.address.postalCode,
      },
      openingHoursSpecification: [
        { dayOfWeek: 'https://schema.org/Monday', opens: '08:00', closes: '18:30' },
      ],
      employee: [{ name: 'Helena Prado Sato', jobTitle: 'Cirurgiã-dentista — Clínica geral' }],
    })
    expect(JSON.stringify(schema)).not.toMatch(/price|offer/i)
  })

  it('describes people, procedures and breadcrumbs', () => {
    expect(
      dentistPersonSchema({ ...dentist, displayName: 'Dr. Rafael Tavares' }, 'x'),
    ).toMatchObject({
      '@type': 'Person',
      jobTitle: 'Cirurgião-dentista — Clínica geral',
      identifier: 'CRO-GO 11482',
    })
    expect(treatmentSchema(treatment, 'x')).toMatchObject({
      '@type': 'MedicalProcedure',
      name: 'Limpeza',
    })
    expect(
      breadcrumbSchema([
        { name: 'Início', path: '/' },
        { name: 'Limpeza', path: '/tratamentos/limpeza' },
      ]),
    ).toMatchObject({
      itemListElement: [
        { position: 1, name: 'Início' },
        { position: 2, name: 'Limpeza' },
      ],
    })
  })

  it('fills optional treatment content sections with empty lists', () => {
    expect(treatment.content).toEqual({
      intro: ['Texto'],
      forWhom: [],
      steps: [],
      preparation: [],
      aftercare: [],
      faqs: [],
    })
    expect(treatmentContentSchema.safeParse({ intro: [] }).success).toBe(false)
  })
})
