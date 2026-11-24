import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/site'

const PRIVATE_PATHS = ['/painel', '/agendamento/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          ...PRIVATE_PATHS,
          ...routing.locales.flatMap((locale) => PRIVATE_PATHS.map((path) => `/${locale}${path}`)),
          '/api/',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
