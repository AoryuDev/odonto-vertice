import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('panel.meta')
  return { title: t('blocks') }
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function BlocksPage({ searchParams }: Props) {
  const t = await getTranslations('panel.blocks')
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-[2rem] leading-tight text-ink">{t('title')}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{t('body')}</p>
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
  const locale = await currentLocale()
  const [{ db, staff }, dentists, query, t] = await Promise.all([
    requireStaff(locale),
    listDentists(locale),
    searchParams,
    getTranslations({ locale, namespace: 'panel.blocks' }),
  ])
  await connection()
  const now = new Date()
  const blocks = await listUpcomingBlocks(db, now, locale)
  const own = dentists.find((dentist) => dentist.id === staff.dentistId)
  const options = dentists.map((dentist) => ({ id: dentist.id, name: dentist.displayName }))

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section
        aria-labelledby="novo-bloqueio"
        className="rounded-[var(--radius-card)] border border-line bg-card p-5 md:p-6"
      >
        <h2 id="novo-bloqueio" className="font-display text-xl text-ink">
          {own ? t('newFor', { dentist: own.displayName }) : t('new')}
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
          {t('upcoming')}
        </h2>
        {query.ok === 'removido' ? (
          <p role="status" className="mt-3 text-sm text-pine-800">
            {t('removed')}
          </p>
        ) : null}
        {query.erro ? (
          <p role="alert" className="mt-3 text-sm text-clay-700">
            {t('removeFailed')}
          </p>
        ) : null}
        {blocks.length === 0 ? <p className="mt-4 text-ink-soft">{t('empty')}</p> : null}
        <ul className="mt-4 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-card">
          {blocks.map((block) => (
            <li key={block.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-ink">{block.reason}</p>
                <p className="text-sm text-ink-soft">
                  {block.dentistName} · {capitalize(formatLongDate(block.start, locale))},{' '}
                  {formatTime(block.start, locale)}–{formatTime(block.end, locale)}
                </p>
              </div>
              <form action={deleteBlock}>
                <LocaleField />
                <input type="hidden" name="id" value={block.id} />
                <button
                  type="submit"
                  className="rounded-full border border-line-strong px-3 py-1.5 text-sm text-ink hover:border-clay-600 hover:text-clay-700"
                >
                  {t('remove')}
                  <span className="sr-only"> {t('removeLabel', { reason: block.reason })}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
