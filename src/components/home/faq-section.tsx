import { getTranslations } from 'next-intl/server'
import { Eyebrow } from '@/components/ui/eyebrow'
import { FaqList, type Faq } from '@/components/site/faq-list'

const FAQ_KEYS = ['insurance', 'prices', 'booking', 'reschedule', 'children', 'pain'] as const

export async function homeFaqs(): Promise<Faq[]> {
  const t = await getTranslations('home.faq.items')
  return FAQ_KEYS.map((key) => ({ question: t(`${key}.question`), answer: t(`${key}.answer`) }))
}

export async function FaqSection() {
  const [t, faqs] = await Promise.all([getTranslations('home.faq'), homeFaqs()])
  return (
    <section id="duvidas" className="container-page py-20 md:py-28">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h2 className="mt-5 text-title text-ink">{t('title')}</h2>
        </div>
        <div className="md:col-span-8">
          <FaqList items={faqs} />
        </div>
      </div>
    </section>
  )
}
