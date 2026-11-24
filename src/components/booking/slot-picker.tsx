import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import {
  formatLongDate,
  formatMonthShort,
  formatTime,
  formatWeekdayShort,
  localDateNoon,
} from '@/lib/format'
import type { SlotBoard, SlotChoice } from '@/modules/booking/booking-view'
import { weekdayOf, type LocalDate } from '@/modules/schedule/domain/clinic-time'

type SlotPickerProps = {
  readonly board: SlotBoard
  readonly hrefForDate: (date: LocalDate) => string
  readonly hrefForSlot: (slot: SlotChoice) => string
  readonly selectedStart?: string
  readonly showDentists?: boolean
}

export function SlotPicker({
  board,
  hrefForDate,
  hrefForSlot,
  selectedStart,
  showDentists,
}: SlotPickerProps) {
  if (!board.selectedDate) {
    return (
      <p className="mt-8 rounded-[var(--radius-soft)] border border-line bg-card p-6 text-ink-soft">
        Não há horários livres nas próximas semanas para esta escolha. Tente outro dentista ou ligue
        para a recepção.
      </p>
    )
  }

  const morning = board.slots.filter((slot) => formatTime(new Date(slot.start)) < '12:00')
  const afternoon = board.slots.filter((slot) => formatTime(new Date(slot.start)) >= '12:00')
  const selectedLabel = formatLongDate(localDateNoon(board.selectedDate))

  return (
    <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
      <DateChooser board={board} hrefForDate={hrefForDate} />
      <section aria-labelledby="horarios-titulo" className="min-w-0">
        <h2
          id="horarios-titulo"
          className="font-display text-subtitle text-ink first-letter:uppercase"
        >
          {selectedLabel}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {board.slots.length} {board.slots.length === 1 ? 'horário livre' : 'horários livres'} ·
          horário de Brasília
        </p>
        <SlotGroup
          title="Manhã"
          slots={morning}
          hrefForSlot={hrefForSlot}
          selectedStart={selectedStart}
          showDentists={showDentists}
        />
        <SlotGroup
          title="Tarde"
          slots={afternoon}
          hrefForSlot={hrefForSlot}
          selectedStart={selectedStart}
          showDentists={showDentists}
        />
      </section>
    </div>
  )
}

function SlotGroup({
  title,
  slots,
  hrefForSlot,
  selectedStart,
  showDentists,
}: {
  title: string
  slots: readonly SlotChoice[]
  hrefForSlot: (slot: SlotChoice) => string
  selectedStart?: string
  showDentists?: boolean
}) {
  if (slots.length === 0) return null
  return (
    <div className="mt-6">
      <h3 className="font-sans text-xs font-semibold tracking-[0.14em] text-clay-600 uppercase">
        {title}
      </h3>
      <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">
        {slots.map((slot) => {
          const time = formatTime(new Date(slot.start))
          const selected = slot.start === selectedStart
          return (
            <li key={slot.start}>
              <Link
                href={hrefForSlot(slot)}
                scroll={false}
                aria-current={selected ? 'true' : undefined}
                title={showDentists ? slot.dentistNames.join(', ') : undefined}
                className={cn(
                  'flex h-12 items-center justify-center rounded-full border text-[0.98rem] tabular transition-colors',
                  selected
                    ? 'border-pine-800 bg-pine-800 text-paper'
                    : 'border-line-strong bg-card text-ink hover:border-pine-800 hover:text-pine-800',
                )}
              >
                {time}
                <span className="sr-only">
                  {showDentists ? `, com ${slot.dentistNames.join(' ou ')}` : ''}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function DateChooser({ board, hrefForDate }: Pick<SlotPickerProps, 'board' | 'hrefForDate'>) {
  const firstWeekday = board.days[0] ? (weekdayOf(board.days[0].date) + 6) % 7 : 0

  return (
    <nav aria-label="Escolha o dia" className="min-w-0">
      <ol className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-1.5 lg:overflow-visible lg:px-0">
        {Array.from({ length: firstWeekday }, (_, index) => (
          <li key={`pad-${index}`} aria-hidden="true" className="hidden lg:block" />
        ))}
        {board.days.map((day) => {
          const noon = localDateNoon(day.date)
          const selected = day.date === board.selectedDate
          const available = day.slotCount > 0
          const label = `${formatLongDate(noon)}${available ? `, ${day.slotCount} horários` : ', sem horários'}`
          const content = (
            <>
              <span className="text-[0.7rem] tracking-wide uppercase">
                {formatWeekdayShort(noon)}
              </span>
              <span className="font-display text-xl leading-none tabular">
                {Number(day.date.slice(8))}
              </span>
              <span className="text-[0.7rem]">{formatMonthShort(noon)}</span>
              <span className="sr-only">{`, ${label}`}</span>
            </>
          )
          const base =
            'relative flex h-[4.5rem] w-14 shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-[0.9rem] border lg:w-auto'
          return (
            <li key={day.date}>
              {available ? (
                <Link
                  href={hrefForDate(day.date)}
                  scroll={false}
                  aria-current={selected ? 'date' : undefined}
                  className={cn(
                    base,
                    selected
                      ? 'border-pine-800 bg-pine-800 text-paper'
                      : 'border-line bg-card text-ink hover:border-pine-700',
                  )}
                >
                  {content}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className={cn(
                    base,
                    'border-transparent bg-paper-deep/60 text-ink-soft line-through decoration-line-strong',
                  )}
                >
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function SlotPickerSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mt-8 grid animate-pulse gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12"
    >
      <div className="flex gap-2 overflow-hidden lg:grid lg:grid-cols-7 lg:gap-1.5">
        {Array.from({ length: 14 }, (_, index) => (
          <span
            key={index}
            className="h-[4.5rem] w-14 shrink-0 rounded-[0.9rem] bg-paper-deep lg:w-auto"
          />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-8 w-64 max-w-full rounded bg-paper-deep" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index} className="h-12 rounded-full bg-paper-deep" />
          ))}
        </div>
      </div>
    </div>
  )
}
