import { getTranslations } from 'next-intl/server'
import { localeFrom } from '@/i18n/server'
import { OG_SIZE, renderOgImage } from '../og-template'

type Props = { params: Promise<{ locale: string }> }

export const contentType = 'image/png'

export async function generateImageMetadata({ params }: Props) {
  const t = await getTranslations({ locale: localeFrom((await params).locale), namespace: 'seo' })
  return [{ id: 'card', alt: t('ogAlt'), size: OG_SIZE, contentType }]
}

export default async function OpenGraphImage({ params }: Props) {
  const t = await getTranslations({ locale: localeFrom((await params).locale), namespace: 'seo' })
  return renderOgImage({ eyebrow: t('ogEyebrow'), title: t('ogTitle') })
}
