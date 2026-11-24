import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { AgendaToolbar, dayTitle } from '@/components/panel/agenda-toolbar'
import { DayView } from '@/components/panel/day-view'
import { WeekView } from '@/components/panel/week-view'
import { formatShortDate, localDateNoon } from '@/lib/format'
import { agendaStats, dayWindow, isVisible, workWeek } from '@/modules/admin/agenda'
import { parseAgendaParams } from '@/modules/admin/agenda-params'
import { listAgenda } from '@/modules/admin/agenda.repository'
import { currentLocale } from '@/i18n/server'
import { requireStaff } from '@/modules/admin/session'
import { listDentists } from '@/modules/catalog/catalog.repository'
import {
  addDays,
  parseLocalTime,
  toInstant,
  toLocalDate,
} from '@/modules/schedule/domain/clinic-time'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'

export const metadata: Metadata = { title: 'Agenda' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default function AgendaPage({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="h-[70dvh] animate-pulse rounded-[var(--radius-card)] bg-paper-deep"
        />
      }
    >
      <Agenda searchParams={searchParams} />
    </Suspense>
  )
}

const MIDNIGHT = parseLocalTime('00:00')

async function Agenda({ searchParams }: Props) {
  const locale = await currentLocale()
  const [{ db, staff }, raw, dentists] = await Promise.all([
    requireStaff(locale),
    searchParams,
    listDentists(),
  ])
  await connection()
  const params = parseAgendaParams(raw)
  const now = new Date()
  const today = toLocalDate(now, CLINIC_TIME_ZONE)
  const date = params.date ?? today

  const scoped =
    staff.role === 'dentist'
      ? dentists.filter((dentist) => dentist.id === staff.dentistId)
      : params.dentist
        ? dentists.filter((dentist) => dentist.slug === params.dentist)
        : dentists
  const visibleDentists = scoped.length > 0 ? scoped : dentists

  const days = params.view === 'semana' ? workWeek(date) : [date]
  const firstDay = days[0] ?? date
  const lastDay = days.at(-1) ?? date
  const entries = (
    await listAgenda(db, {
      from: toInstant(firstDay, MIDNIGHT, CLINIC_TIME_ZONE),
      to: toInstant(addDays(lastDay, 1), MIDNIGHT, CLINIC_TIME_ZONE),
      dentistIds: visibleDentists.map((dentist) => dentist.id),
    })
  ).filter((entry) => isVisible(entry, params.showCancelled))

  const stats = agendaStats(entries)
  const title =
    params.view === 'semana'
      ? `${formatShortDate(localDateNoon(firstDay))} a ${formatShortDate(localDateNoon(lastDay))}`
      : dayTitle(date)

  return (
    <div className="space-y-6">
      <AgendaToolbar
        params={params}
        date={date}
        today={today}
        title={title}
        dentists={dentists}
        canFilter={staff.role === 'reception'}
        locale={locale}
      />
      <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        {[
          ['Agendadas', stats.scheduled],
          ['Realizadas', stats.completed],
          ['Faltas', stats.no_show],
          ...(params.showCancelled ? ([['Canceladas', stats.cancelled]] as const) : []),
        ].map(([label, value]) => (
          <div key={label} className="flex items-baseline gap-2">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="font-display text-2xl text-ink tabular">{value}</dd>
          </div>
        ))}
      </dl>
      {params.view === 'semana' ? (
        <WeekView
          days={days}
          today={today}
          entries={entries}
          dentists={visibleDentists}
          params={params}
        />
      ) : (
        <DayView
          date={date}
          window={dayWindow(
            date,
            parseLocalTime('07:00'),
            parseLocalTime('19:00'),
            CLINIC_TIME_ZONE,
          )}
          dentists={visibleDentists}
          entries={entries}
          now={now}
        />
      )}
    </div>
  )
}
