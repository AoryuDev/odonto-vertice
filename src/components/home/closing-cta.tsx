import Image from 'next/image'
import { ButtonLink } from '@/components/ui/button'
import { photos } from '@/content/photos'
import { clinic } from '@/modules/catalog/clinic'

export function ClosingCta() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="relative grid overflow-hidden rounded-[2rem] bg-pine-800 text-paper md:grid-cols-12">
        <div className="relative z-10 p-8 md:col-span-7 md:p-14">
          <h2 className="text-title">Escolha um horário agora. Leva menos de dois minutos.</h2>
          <p className="mt-5 max-w-lg text-pine-100">
            Os horários mostrados são os que estão livres de verdade na agenda de cada dentista.
            Prefere falar com alguém? A recepção atende no {clinic.phone.display}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/agendar" variant="inverse" size="lg">
              Agendar consulta
            </ButtonLink>
          </div>
        </div>
        <div className="relative hidden md:col-span-5 md:block">
          <Image
            src={photos.clinicRoom.src}
            alt={photos.clinicRoom.alt}
            placeholder="blur"
            sizes="32vw"
            className="absolute inset-0 size-full object-cover opacity-90"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-pine-800 to-transparent"
          />
        </div>
      </div>
    </section>
  )
}
