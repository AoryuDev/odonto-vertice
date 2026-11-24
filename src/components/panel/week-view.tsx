import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { formatShortDate, formatTime, formatWeekdayShort, localDateNoon } from '@/lib/format'
import { agendaHref, type AgendaParams } from '@/modules/admin/agenda-params'
import { groupByDate, type AgendaEntry } from '@/modules/admin/agenda'
import type { Dentist } from '@/modules/catalog/types'
import type { LocalDate } from '@/modules/schedule/domain/clinic-time'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'
import { STATUS_STYLES } from './status'

const DENTIST_DOTS = ['bg-pine-700', 'bg-clay-500', 'bg-ink-soft'] as const

export function WeekView({
  days,
  today,
  entries,
  dentists,
  params,
}: {
  days: readonly LocalDate[]
  today: LocalDate
  entries: readonly AgendaEntry[]
  dentists: readonly Dentist[]
  params: AgendaParams
}) {
  const locale = useLocale()
  const byDate = groupByDate(entries, CLINIC_TIME_ZONE)
  const dot = (dentistId: string) =>
    DENTIST_DOTS[
      Math.max(
        0,
        dentists.findIndex((dentist) => dentist.id === dentistId),
      ) % DENTIST_DOTS.length
    ]

  return (
    <div>
      {dentists.length > 1 ? (
        <ul className="mb-4 flex flex-wrap gap-4 text-sm text-ink-soft">
          {dentists.map((dentist) => (
            <li key={dentist.id} className="flex items-center gap-2">
              <span aria-hidden="true" className={cn('size-2.5 rounded-full', dot(dentist.id))} />
              {dentist.displayName}
            </li>
          ))}
        </ul>
      ) : null}
      <ol className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {days.map((date) => {
          const dayEntries = byDate.get(date) ?? []
          const appointments = dayEntries.filter(
            (entry) => entry.kind === 'appointment' && entry.status !== 'cancelled',
          ).length
          return (
            <li
              key={date}
              className={cn(
                'rounded-[var(--radius-soft)] border bg-card',
                date === today ? 'border-pine-700' : 'border-line',
              )}
            >
              <Link
                href={agendaHref({ ...params, view: 'dia', date })}
                className="flex items-baseline justify-between border-b border-line px-4 py-3 hover:bg-paper"
              >
                <span className="font-medium text-ink capitalize">
                  {formatWeekdayShort(localDateNoon(date), locale)}{' '}
                  <span className="tabular">{formatShortDate(localDateNoon(date), locale)}</span>
                </span>
                <span className="text-xs text-ink-soft">{appointments} consultas</span>
              </Link>
              <ul className="space-y-1.5 p-2">
                {dayEntries.length === 0 ? (
                  <li className="px-2 py-3 text-sm text-ink-soft">Sem consultas</li>
                ) : null}
                {dayEntries.map((entry) =>
                  entry.kind === 'block' ? (
                    <li
                      key={entry.id}
                      className="rounded-lg border border-dashed border-line-strong px-2.5 py-1.5 text-xs text-ink-soft"
                    >
                      <span className="tabular">
                        {formatTime(entry.start, locale)}–{formatTime(entry.end, locale)}
                      </span>{' '}
                      · Bloqueado: {entry.reason}
                    </li>
                  ) : (
                    <li key={entry.id}>
                      <Link
                        href={`/painel/consultas/${entry.id}`}
                        className={cn(
                          'flex items-start gap-2 rounded-lg border-l-4 px-2.5 py-1.5 text-xs',
                          STATUS_STYLES[entry.status],
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn('mt-1 size-2 shrink-0 rounded-full', dot(entry.dentistId))}
                        />
                        <span className="min-w-0">
                          <span className="font-medium tabular">
                            {formatTime(entry.start, locale)}
                          </span>{' '}
                          {entry.patientName}
                          <span className="block truncate opacity-80">{entry.treatmentName}</span>
                        </span>
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
