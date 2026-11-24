import Image from 'next/image'
import mapImage from '@/assets/map-setor-bueno.png'
import { InteractiveMapToggle } from '@/components/site/interactive-map'
import { ButtonLink } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ArrowUpRightIcon, LogoMark } from '@/components/ui/icons'
import { photos } from '@/content/photos'
import { formatHour } from '@/lib/format'
import { openingHours } from '@/modules/catalog/catalog.repository'
import { clinic, directionsUrl, formatAddressLine } from '@/modules/catalog/clinic'
import { WEEKDAY_LABELS } from '@/modules/schedule/domain/opening-hours'

export async function LocationSection() {
  const hours = await openingHours()

  return (
    <section id="localizacao" className="bg-paper-deep py-20 md:py-28">
      <div className="container-page grid gap-10 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-line-strong bg-card md:aspect-auto md:h-full md:min-h-[32rem]">
            <InteractiveMapToggle latitude={clinic.geo.latitude} longitude={clinic.geo.longitude}>
              <Image
                src={mapImage}
                alt={`Mapa do Setor Bueno com a localização da clínica na ${clinic.address.street.split(',')[0]}, perto do Parque Vaca Brava`}
                placeholder="blur"
                sizes="(min-width: 768px) 56vw, 100vw"
                className="size-full object-cover [filter:grayscale(0.8)_sepia(0.22)_contrast(0.94)_brightness(1.04)]"
              />
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(100%+4px)]"
              >
                <span className="flex size-14 rotate-45 items-center justify-center rounded-full rounded-br-none bg-pine-800 text-paper shadow-[0_10px_24px_-10px_rgba(21,58,47,0.8)]">
                  <LogoMark size={26} className="-rotate-45" />
                </span>
              </span>
            </InteractiveMapToggle>
            <p className="absolute bottom-2 left-3 rounded bg-card/90 px-1.5 text-[0.7rem] text-ink-soft">
              ©{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                OpenStreetMap
              </a>{' '}
              contributors
            </p>
          </div>
        </div>

        <div className="flex flex-col md:col-span-5">
          <Eyebrow>Como chegar</Eyebrow>
          <h2 className="mt-5 text-title text-ink">No Setor Bueno, perto do Vaca Brava.</h2>
          <address className="mt-6 text-lg text-ink not-italic">
            {formatAddressLine()}
            <span className="mt-1 block text-[0.98rem] text-ink-soft">
              {clinic.landmark} {clinic.parking}
            </span>
          </address>

          <table className="mt-8 w-full text-[0.98rem]">
            <caption className="sr-only">Horário de funcionamento</caption>
            <tbody>
              {hours.map((entry) => (
                <tr key={entry.weekday} className="border-b border-line-strong/60">
                  <th scope="row" className="py-2.5 text-left font-normal text-ink-soft">
                    {WEEKDAY_LABELS[entry.weekday]}
                  </th>
                  <td className="py-2.5 text-right text-ink tabular">
                    {formatHour(entry.opensAt)} – {formatHour(entry.closesAt)}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-2.5 text-left font-normal text-ink-soft">
                  Domingo e feriados
                </th>
                <td className="py-2.5 text-right text-ink-soft">Fechado</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={directionsUrl()} target="_blank" rel="noopener noreferrer">
              Traçar rota
              <ArrowUpRightIcon size={18} />
            </ButtonLink>
            <ButtonLink href={`tel:${clinic.phone.e164}`} variant="secondary">
              Ligar · <span className="tabular">{clinic.phone.display}</span>
            </ButtonLink>
          </div>

          <div className="mt-10 hidden items-center gap-4 md:flex">
            <Image
              src={photos.reception.src}
              alt={photos.reception.alt}
              placeholder="blur"
              sizes="7rem"
              className="size-20 shrink-0 rounded-full object-cover"
            />
            <p className="text-sm text-ink-soft">
              Recepção com café e água. Chegue com dez minutos de antecedência para o cadastro.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
