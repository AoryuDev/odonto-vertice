import Image from 'next/image'
import { Suspense } from 'react'
import { ButtonLink } from '@/components/ui/button'
import { ChatIcon } from '@/components/ui/icons'
import { photos } from '@/content/photos'
import { clinic, whatsappUrl } from '@/modules/catalog/clinic'
import { NextSlotCard, NextSlotSkeleton } from './next-slot-card'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid gap-10 pt-8 pb-14 md:grid-cols-12 md:gap-8 md:pt-14 md:pb-24 lg:gap-14">
        <div className="md:col-span-7 md:self-center">
          <p className="animate-fade-up text-[0.95rem] text-ink-soft">
            <span className="font-semibold text-pine-800">{clinic.address.neighborhood}</span>
            <span aria-hidden="true" className="mx-2 text-line-strong">
              /
            </span>
            Goiânia
          </p>
          <h1 className="mt-5 text-display text-ink">
            Cuidar dos dentes fica mais simples quando alguém{' '}
            <em className="text-pine-800 italic">explica</em>.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lead text-ink-soft">
            Somos três dentistas, de clínica geral, ortodontia e implantes, atendendo famílias no
            Setor Bueno. Você sai de cada consulta sabendo o que foi feito, o que vem depois e
            quantas sessões ainda faltam.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/agendar" size="lg">
              Agendar pelo site
            </ButtonLink>
            <ButtonLink
              href={whatsappUrl('Olá! Gostaria de agendar uma consulta.')}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              <ChatIcon size={20} />
              Falar no WhatsApp
            </ButtonLink>
          </div>
          <p className="mt-5 text-sm text-ink-soft">
            Particular e convênio · Confirmação na hora, por e-mail
          </p>
        </div>

        <div className="relative md:col-span-5">
          <div
            aria-hidden="true"
            className="absolute -top-6 -right-24 bottom-10 left-16 rounded-tl-[7rem] bg-pine-100 md:-top-10 md:left-24"
          />
          <div className="relative overflow-hidden rounded-tl-[5.5rem] rounded-tr-[1.5rem] rounded-br-[1.5rem] rounded-bl-[1.5rem] md:rounded-tl-[8rem]">
            <Image
              src={photos.hero.src}
              alt={photos.hero.alt}
              priority
              placeholder="blur"
              sizes="(min-width: 1216px) 460px, (min-width: 768px) 40vw, 100vw"
              className="aspect-[4/5] w-full object-cover object-[60%_30%] md:aspect-[5/6]"
            />
          </div>
          <div className="relative -mt-12 ml-4 max-w-[22rem] sm:ml-8 md:absolute md:bottom-10 md:-left-14 md:mt-0 md:ml-0">
            <Suspense fallback={<NextSlotSkeleton />}>
              <NextSlotCard />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
