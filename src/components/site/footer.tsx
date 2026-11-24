import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { formatHour } from '@/lib/format'
import { listTreatments, openingHours, technicalLead } from '@/modules/catalog/catalog.repository'
import { clinic, directionsUrl, formatAddressLine, whatsappUrl } from '@/modules/catalog/clinic'
import { summarizeWeekHours } from '@/modules/schedule/domain/opening-hours'
import { Logo } from './logo'

export async function SiteFooter() {
  'use cache'
  cacheLife('days')

  const [lead, hours, treatments] = await Promise.all([
    technicalLead(),
    openingHours(),
    listTreatments(),
  ])
  const year = new Date().getFullYear()

  return (
    <footer className="bg-pine-950 text-pine-100">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Logo tone="inverse" />
          <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-pine-200">
            Clínica geral, ortodontia e implantes no Setor Bueno. Atendimento particular e por
            convênio.
          </p>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-sans text-sm font-semibold tracking-[0.12em] text-clay-200 uppercase">
            Endereço
          </h2>
          <address className="mt-4 text-[0.95rem] leading-relaxed not-italic">
            {formatAddressLine()}
            <br />
            CEP {clinic.address.postalCode}
          </address>
          <a
            href={directionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-[0.95rem] text-paper underline decoration-pine-300 underline-offset-4 hover:decoration-paper"
          >
            Como chegar
          </a>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-sans text-sm font-semibold tracking-[0.12em] text-clay-200 uppercase">
            Horários
          </h2>
          <dl className="mt-4 space-y-2 text-[0.95rem]">
            {summarizeWeekHours(hours).map((group) => (
              <div key={group.label}>
                <dt className="text-pine-300">{group.label}</dt>
                <dd className="tabular">
                  {formatHour(group.opensAt)} às {formatHour(group.closesAt)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-sans text-sm font-semibold tracking-[0.12em] text-clay-200 uppercase">
            Contato
          </h2>
          <ul className="mt-4 space-y-2 text-[0.95rem]">
            <li>
              <a href={`tel:${clinic.phone.e164}`} className="tabular hover:text-paper">
                {clinic.phone.display}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-paper"
              >
                WhatsApp <span className="tabular">{clinic.whatsapp.display}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${clinic.email}`} className="hover:text-paper">
                {clinic.email}
              </a>
            </li>
          </ul>
          <h2 className="mt-8 font-sans text-sm font-semibold tracking-[0.12em] text-clay-200 uppercase">
            Tratamentos
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.95rem]">
            {treatments.map((treatment) => (
              <li key={treatment.id}>
                <Link href={`/tratamentos/${treatment.slug}`} className="hover:text-paper">
                  {treatment.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-pine-800">
        <div className="container-page flex flex-col gap-3 pt-6 pb-28 text-sm text-pine-300 md:flex-row md:items-center md:justify-between md:pb-6">
          <p>
            <span className="text-pine-100">Responsável técnico:</span>{' '}
            {lead.displayName.split(' ')[0]} {lead.fullName} — {lead.croRegistration}
          </p>
          <p>
            © {year} {clinic.name}. {clinic.legalNote}{' '}
            <Link href="/creditos" className="underline underline-offset-4 hover:text-paper">
              Créditos das fotos
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
