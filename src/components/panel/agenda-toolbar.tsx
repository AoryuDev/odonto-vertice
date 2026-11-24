import { getPathname, Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { capitalize, formatLongDate, localDateNoon } from '@/lib/format'
import { agendaHref, type AgendaParams } from '@/modules/admin/agenda-params'
import type { Dentist } from '@/modules/catalog/types'
import { addDays, type LocalDate } from '@/modules/schedule/domain/clinic-time'

export function AgendaToolbar({
  params,
  date,
  today,
  title,
  dentists,
  canFilter,
  locale,
}: {
  params: AgendaParams
  date: LocalDate
  today: LocalDate
  title: string
  dentists: readonly Dentist[]
  canFilter: boolean
  locale: AppLocale
}) {
  const step = params.view === 'semana' ? 7 : 1
  const link = (overrides: Partial<AgendaParams> & { date?: LocalDate }) =>
    agendaHref({ ...params, ...overrides, date: overrides.date ?? date })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">
            {params.view === 'semana' ? 'Semana' : date === today ? 'Hoje' : 'Dia'}
          </p>
          <h1 className="font-display text-[2rem] leading-tight text-ink">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-line-strong bg-card p-1">
            {(['dia', 'semana'] as const).map((view) => (
              <Link
                key={view}
                href={link({ view })}
                aria-current={params.view === view ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm capitalize',
                  params.view === view ? 'bg-pine-800 text-paper' : 'text-ink-soft hover:text-ink',
                )}
              >
                {view}
              </Link>
            ))}
          </div>
          <div className="inline-flex items-center gap-1">
            <Link
              href={link({ date: addDays(date, -step) })}
              className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-card hover:border-ink"
            >
              <ArrowLeftIcon size={18} />
              <span className="sr-only">
                {params.view === 'semana' ? 'Semana anterior' : 'Dia anterior'}
              </span>
            </Link>
            <Link
              href={link({ date: today })}
              className="rounded-full border border-line-strong bg-card px-4 py-2 text-sm hover:border-ink"
            >
              Hoje
            </Link>
            <Link
              href={link({ date: addDays(date, step) })}
              className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-card hover:border-ink"
            >
              <ArrowRightIcon size={18} />
              <span className="sr-only">
                {params.view === 'semana' ? 'Próxima semana' : 'Próximo dia'}
              </span>
            </Link>
          </div>
          <form
            action={getPathname({ href: '/painel', locale })}
            className="flex items-center gap-2"
          >
            <label htmlFor="agenda-date" className="sr-only">
              Ir para a data
            </label>
            <input
              id="agenda-date"
              type="date"
              name="data"
              defaultValue={date}
              className="h-10 rounded-full border border-line-strong bg-card px-3 text-sm"
            />
            {params.view === 'semana' ? <input type="hidden" name="visao" value="semana" /> : null}
            {params.dentist ? <input type="hidden" name="dentista" value={params.dentist} /> : null}
            <button type="submit" className="h-10 rounded-full bg-pine-800 px-4 text-sm text-paper">
              Ir
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {canFilter ? (
          <nav aria-label="Filtrar por dentista" className="flex flex-wrap gap-2">
            <FilterPill href={link({ dentist: undefined })} active={!params.dentist}>
              Todos
            </FilterPill>
            {dentists.map((dentist) => (
              <FilterPill
                key={dentist.id}
                href={link({ dentist: dentist.slug })}
                active={params.dentist === dentist.slug}
              >
                {dentist.displayName}
              </FilterPill>
            ))}
          </nav>
        ) : (
          <span />
        )}
        <Link
          href={link({ showCancelled: !params.showCancelled })}
          className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          {params.showCancelled ? 'Ocultar canceladas' : 'Mostrar canceladas'}
        </Link>
      </div>
    </div>
  )
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm',
        active
          ? 'border-pine-800 bg-pine-100 text-pine-900'
          : 'border-line-strong text-ink-soft hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </Link>
  )
}

export function dayTitle(date: LocalDate, locale: AppLocale): string {
  return capitalize(formatLongDate(localDateNoon(date), locale))
}
