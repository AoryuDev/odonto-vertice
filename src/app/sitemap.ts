import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { listDentists, listTreatments } from '@/modules/catalog/catalog.repository'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [treatments, dentists] = await Promise.all([listTreatments(), listDentists()])
  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/agendar'), changeFrequency: 'daily', priority: 0.9 },
    ...treatments.map((treatment) => ({
      url: absoluteUrl(`/tratamentos/${treatment.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...dentists.map((dentist) => ({
      url: absoluteUrl(`/equipe/${dentist.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
