import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { LocaleField } from '@/components/site/locale-field'
import { deleteBlock } from '@/app/[locale]/painel/(app)/actions'
import { BlockForm } from '@/components/panel/block-form'
import { capitalize, formatLongDate, formatTime } from '@/lib/format'
import { listUpcomingBlocks } from '@/modules/admin/agenda.repository'
import { currentLocale } from '@/i18n/server'
import { requireStaff } from '@/modules/admin/session'
import { listDentists } from '@/modules/catalog/catalog.repository'
import { toLocalDate } from '@/modules/schedule/domain/clinic-time'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'

export const metadata: Metadata = { title: 'Bloqueios' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default function BlocksPage({ searchParams }: Props) {
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-[2rem] leading-tight text-ink">Bloqueios de agenda</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Use para cursos, congressos, manutenção de equipamento ou qualquer ausência. Horários
        bloqueados somem na hora do agendamento online.
      </p>
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="mt-8 h-96 animate-pulse rounded-[var(--radius-card)] bg-paper-deep"
          />
        }
      >
        <BlocksContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function BlocksContent({ searchParams }: Props) {
  const [{ db, staff }, dentists, query] = await Promise.all([
    requireStaff(await currentLocale()),
    listDentists(),
    searchParams,
  ])
  await connection()
  const now = new Date()
  const blocks = await listUpcomingBlocks(db, now)
  const own = dentists.find((dentist) => dentist.id === staff.dentistId)
  const options = dentists.map((dentist) => ({ id: dentist.id, name: dentist.displayName }))

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section
        aria-labelledby="novo-bloqueio"
        className="rounded-[var(--radius-card)] border border-line bg-card p-5 md:p-6"
      >
        <h2 id="novo-bloqueio" className="font-display text-xl text-ink">
          Novo bloqueio{own ? ` na agenda de ${own.displayName}` : ''}
        </h2>
        <div className="mt-5">
          <BlockForm
            dentists={options}
            fixedDentist={own ? { id: own.id, name: own.displayName } : undefined}
            minDate={toLocalDate(now, CLINIC_TIME_ZONE)}
          />
        </div>
      </section>

      <section aria-labelledby="proximos">
        <h2 id="proximos" className="font-display text-xl text-ink">
          Próximos bloqueios
        </h2>
        {query.ok === 'removido' ? (
          <p role="status" className="mt-3 text-sm text-pine-800">
            Bloqueio removido.
          </p>
        ) : null}
        {query.erro ? (
          <p role="alert" className="mt-3 text-sm text-clay-700">
            Não foi possível remover esse bloqueio.
          </p>
        ) : null}
        {blocks.length === 0 ? (
          <p className="mt-4 text-ink-soft">Nenhum bloqueio nos próximos meses.</p>
        ) : null}
        <ul className="mt-4 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card">
          {blocks.map((block) => (
            <li key={block.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-ink">{block.reason}</p>
                <p className="text-sm text-ink-soft">
                  {block.dentistName} · {capitalize(formatLongDate(block.start))},{' '}
                  {formatTime(block.start)}–{formatTime(block.end)}
                </p>
              </div>
              <form action={deleteBlock}>
                <LocaleField />
                <input type="hidden" name="id" value={block.id} />
                <button
                  type="submit"
                  className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink hover:border-clay-600 hover:text-clay-700"
                >
                  Remover<span className="sr-only"> bloqueio {block.reason}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
