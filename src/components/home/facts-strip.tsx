import { formatHour } from '@/lib/format'
import { openingHours } from '@/modules/catalog/catalog.repository'
import { clinic } from '@/modules/catalog/clinic'
import { summarizeWeekHours } from '@/modules/schedule/domain/opening-hours'

export async function FactsStrip() {
  const [weekdays, saturday] = summarizeWeekHours(await openingHours())

  const facts = [
    {
      label: 'Segunda a sábado',
      value: `${weekdays ? `${formatHour(weekdays.opensAt)} às ${formatHour(weekdays.closesAt)}` : ''}${saturday ? ` · sáb até ${formatHour(saturday.closesAt)}` : ''}`,
    },
    { label: 'Pagamento', value: 'Particular e convênios' },
    { label: 'Estacionamento', value: 'Conveniado, no prédio' },
    { label: 'Referência', value: clinic.landmark.replace('.', '') },
  ]

  return (
    <section aria-label="Informações rápidas" className="border-y border-line bg-card/60">
      <dl className="container-page grid grid-cols-2 gap-x-6 gap-y-5 py-6 md:grid-cols-4 md:py-7">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="md:border-l md:border-line md:pl-6 md:first:border-l-0 md:first:pl-0"
          >
            <dt className="text-[0.78rem] font-semibold tracking-[0.12em] text-clay-600 uppercase">
              {fact.label}
            </dt>
            <dd className="mt-1 text-[0.98rem] leading-snug text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
