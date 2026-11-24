import type { Metadata } from 'next'
import Image from 'next/image'
import { Eyebrow } from '@/components/ui/eyebrow'
import { uniquePhotoCredits } from '@/content/photos'

export const metadata: Metadata = {
  title: 'Créditos das fotos',
  description: 'Fotografias usadas no site da Odonto Vértice, com autoria e licença.',
  alternates: { canonical: '/creditos' },
  robots: { index: false, follow: true },
}

export default function CreditsPage() {
  const credits = uniquePhotoCredits()
  return (
    <section className="container-page py-14 md:py-20">
      <Eyebrow>Créditos</Eyebrow>
      <h1 className="mt-5 text-title text-ink">Fotografias</h1>
      <p className="mt-5 max-w-2xl text-ink-soft">
        Todas as fotos são de bancos de imagem com licença para uso comercial (Unsplash License). As
        pessoas retratadas são modelos e não têm relação com a clínica, que é fictícia.
      </p>
      <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {credits.map((photo) => (
          <li key={photo.credit.url}>
            <Image
              src={photo.src}
              alt={photo.alt}
              placeholder="blur"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="aspect-[4/3] w-full rounded-[var(--radius-soft)] object-cover"
            />
            <p className="mt-3 text-sm text-ink-soft">
              Foto de{' '}
              <a
                href={photo.credit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline underline-offset-4"
              >
                {photo.credit.name}
              </a>{' '}
              no Unsplash
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
