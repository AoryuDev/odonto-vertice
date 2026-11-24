import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { dentistPhoto } from '@/content/photos'
import { cn } from '@/lib/cn'
import { formatTime } from '@/lib/format'
import {
  offHoursBands,
  placeInWindow,
  type AgendaEntry,
  type TimeWindow,
} from '@/modules/admin/agenda'
import type { Dentist } from '@/modules/catalog/types'
import { weekdayOf, type LocalDate } from '@/modules/schedule/domain/clinic-time'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'
import { STATUS_LABELS, STATUS_STYLES } from './status'

const PIXELS_PER_MINUTE = 1.7

export function DayView({
  date,
  window,
  dentists,
  entries,
  now,
}: {
  date: LocalDate
  window: TimeWindow
  dentists: readonly Dentist[]
  entries: readonly AgendaEntry[]
  now: Date
}) {
  const minutes = (window.end.getTime() - window.start.getTime()) / 60000
  const height = minutes * PIXELS_PER_MINUTE
  const hours = Array.from(
    { length: Math.floor(minutes / 60) + 1 },
    (_, index) => new Date(window.start.getTime() + index * 3600000),
  )
  const nowPlacement = placeInWindow({ start: now, end: new Date(now.getTime() + 60000) }, window)

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-card">
      <div
        className="min-w-[44rem]"
        style={{
          display: 'grid',
          gridTemplateColumns: `4rem repeat(${dentists.length}, minmax(12rem, 1fr))`,
        }}
      >
        <div className="sticky top-0 z-10 border-b border-line bg-card" />
        {dentists.map((dentist) => {
          const photo = dentistPhoto(dentist.photoKey)
          return (
            <div
              key={dentist.id}
              className="sticky top-0 z-10 flex items-center gap-3 border-b border-l border-line bg-card px-4 py-3"
            >
              <Image
                src={photo.src}
                alt=""
                sizes="2.5rem"
                className="size-10 rounded-full object-cover object-top"
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{dentist.displayName}</p>
                <p className="text-xs text-ink-soft">
                  {
                    entries.filter(
                      (entry) =>
                        entry.kind === 'appointment' &&
                        entry.dentistId === dentist.id &&
                        entry.status !== 'cancelled',
                    ).length
                  }{' '}
                  consultas
                </p>
              </div>
            </div>
          )
        })}

        <div className="relative" style={{ height }}>
          {hours.map((hour) => {
            const placement = placeInWindow(
              { start: hour, end: new Date(hour.getTime() + 60000) },
              window,
            )
            return placement ? (
              <span
                key={hour.toISOString()}
                className="absolute right-2 -translate-y-1/2 text-xs text-ink-soft tabular"
                style={{ top: `${placement.topPercent}%` }}
              >
                {formatTime(hour)}
              </span>
            ) : null
          })}
        </div>

        {dentists.map((dentist) => {
          const schedule = dentist.schedules.find(
            (candidate) => candidate.weekday === weekdayOf(date),
          )
          return (
            <div key={dentist.id} className="relative border-l border-line" style={{ height }}>
              {hours.map((hour) => {
                const placement = placeInWindow(
                  { start: hour, end: new Date(hour.getTime() + 60000) },
                  window,
                )
                return placement ? (
                  <span
                    key={hour.toISOString()}
                    aria-hidden="true"
                    className="absolute inset-x-0 border-t border-line/70"
                    style={{ top: `${placement.topPercent}%` }}
                  />
                ) : null
              })}
              {offHoursBands(schedule, date, window, CLINIC_TIME_ZONE).map((band, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="absolute inset-x-0 bg-[repeating-linear-gradient(135deg,transparent_0,transparent_6px,rgba(201,186,162,0.25)_6px,rgba(201,186,162,0.25)_8px)]"
                  style={{ top: `${band.topPercent}%`, height: `${band.heightPercent}%` }}
                />
              ))}
              {entries
                .filter((entry) => entry.dentistId === dentist.id)
                .map((entry) => {
                  const placement = placeInWindow(entry, window)
                  if (!placement) return null
                  const style = {
                    top: `${placement.topPercent}%`,
                    height: `${placement.heightPercent}%`,
                  }
                  const time = `${formatTime(entry.start)}–${formatTime(entry.end)}`
                  if (entry.kind === 'block') {
                    return (
                      <div
                        key={entry.id}
                        className="absolute inset-x-1.5 overflow-hidden rounded-lg border border-dashed border-line-strong bg-paper-deep/90 px-2.5 py-1.5 text-xs text-ink-soft"
                        style={style}
                      >
                        <span className="font-medium text-ink">Bloqueado</span> · {entry.reason}
                      </div>
                    )
                  }
                  return (
                    <Link
                      key={entry.id}
                      href={`/painel/consultas/${entry.id}`}
                      className={cn(
                        'absolute inset-x-1.5 overflow-hidden rounded-lg border-l-4 px-2.5 py-1 text-xs leading-snug shadow-[0_1px_0_rgba(27,40,35,0.06)] transition-shadow hover:shadow-[0_6px_16px_-8px_rgba(27,40,35,0.5)]',
                        STATUS_STYLES[entry.status],
                      )}
                      style={style}
                    >
                      <span className="block font-medium tabular">{time}</span>
                      <span className="block truncate">{entry.patientName}</span>
                      <span className="block truncate opacity-80">
                        {entry.treatmentName}
                        {entry.status !== 'scheduled' ? ` · ${STATUS_LABELS[entry.status]}` : ''}
                      </span>
                    </Link>
                  )
                })}
              {nowPlacement ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-[1] border-t-2 border-clay-500"
                  style={{ top: `${nowPlacement.topPercent}%` }}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
