import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { languageAlternates, localizedUrl } from '@/i18n/seo'
import { absoluteUrl } from '@/lib/site'
import { listDentists, listTreatments } from '@/modules/catalog/catalog.repository'

type Page = {
  readonly href: string
  readonly changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  readonly priority: number
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [treatments, dentists] = await Promise.all([
    listTreatments(routing.defaultLocale),
    listDentists(routing.defaultLocale),
  ])
  const pages: Page[] = [
    { href: '/', changeFrequency: 'weekly', priority: 1 },
    { href: '/agendar', changeFrequency: 'daily', priority: 0.9 },
    ...treatments.map((treatment) => ({
      href: `/tratamentos/${treatment.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...dentists.map((dentist) => ({
      href: `/equipe/${dentist.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  return pages.flatMap((page) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(page.href)).map(([language, path]) => [
        language,
        absoluteUrl(path),
      ]),
    )
    return routing.locales.map((locale) => ({
      url: localizedUrl(page.href, locale),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages },
    }))
  })
}
