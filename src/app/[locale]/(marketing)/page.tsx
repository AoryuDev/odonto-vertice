import { ApproachSection } from '@/components/home/approach-section'
import { ClosingCta } from '@/components/home/closing-cta'
import { FactsStrip } from '@/components/home/facts-strip'
import { FaqSection, homeFaqs } from '@/components/home/faq-section'
import { Hero } from '@/components/home/hero'
import { LocationSection } from '@/components/home/location-section'
import { TeamSection } from '@/components/home/team-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { TreatmentsSection } from '@/components/home/treatments-section'
import { JsonLd } from '@/components/site/json-ld'
import { photos } from '@/content/photos'
import { absoluteUrl } from '@/lib/site'
import { listDentists, openingHours } from '@/modules/catalog/catalog.repository'
import { dentistOrganizationSchema } from '@/modules/catalog/structured-data'
import { currentLocale } from '@/i18n/server'

export default async function HomePage() {
  const locale = await currentLocale()
  const [hours, dentists, faqs] = await Promise.all([
    openingHours(),
    listDentists(locale),
    homeFaqs(),
  ])

  return (
    <>
      <JsonLd
        data={dentistOrganizationSchema({
          hours,
          dentists,
          imageUrl: absoluteUrl(photos.clinicRoom.src.src),
        })}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }}
      />
      <Hero />
      <FactsStrip />
      <TreatmentsSection />
      <TeamSection />
      <ApproachSection />
      <TestimonialsSection />
      <FaqSection />
      <LocationSection />
      <ClosingCta />
    </>
  )
}
