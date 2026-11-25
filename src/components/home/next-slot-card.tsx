import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { currentLocale } from '@/i18n/server'
import { ArrowRightIcon, CalendarIcon } from '@/components/ui/icons'
import {
  capitalize,
  formatList,
  formatShortDate,
  formatTime,
  formatWeekdayShort,
} from '@/lib/format'
import { bookingHref } from '@/modules/booking/booking-routes'
import { findNextSlot } from '@/modules/schedule/next-slot'

export async function NextSlotCard() {
  const locale = await currentLocale()
  const [t, next] = await Promise.all([
    getTranslations({ locale, namespace: 'home.nextSlot' }),
    findNextSlot('avaliacao', locale),
  ])

  if (!next) {
    return (
      <SlotCardFrame href="/agendar" eyebrow={t('eyebrow')}>
        <span className="text-ink-soft">{t('seeAll')}</span>
      </SlotCardFrame>
    )
  }

  const start = next.slot.start
  const day = next.isToday
    ? t('today')
    : next.isTomorrow
      ? t('tomorrow')
      : t('weekdayDate', {
          weekday: formatWeekdayShort(start, locale),
          date: formatShortDate(start, locale),
        })
  const href = bookingHref({ treatment: next.treatmentSlug, dentist: 'qualquer', date: next.date })

  return (
    <SlotCardFrame href={href} eyebrow={t('eyebrow')}>
      <span className="block font-display text-[1.65rem] leading-tight text-ink">
        {t.rich('when', {
          day: capitalize(day),
          time: formatTime(start, locale),
          tabular: (chunks) => <span className="tabular">{chunks}</span>,
        })}
      </span>
      <span className="mt-1 block text-sm text-ink-soft">
        {t('with', { names: formatList(next.dentistNames.slice(0, 2), locale, 'disjunction') })}
      </span>
    </SlotCardFrame>
  )
}

function SlotCardFrame({
  href,
  eyebrow,
  children,
}: {
  href: string
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[1.25rem] border border-line bg-card p-4 pr-5 shadow-[0_18px_40px_-28px_rgba(21,58,47,0.45)] transition-colors hover:border-pine-300"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-pine-100 text-pine-800">
        <CalendarIcon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.75rem] font-semibold tracking-[0.12em] text-clay-600 uppercase">
          {eyebrow}
        </span>
        {children}
      </span>
      <ArrowRightIcon className="shrink-0 text-pine-800 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

export function NextSlotSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-4 rounded-[1.25rem] border border-line bg-card p-4 pr-5"
    >
      <span className="size-12 shrink-0 rounded-full bg-pine-100" />
      <span className="flex-1 space-y-2">
        <span className="block h-3 w-36 rounded bg-paper-deep" />
        <span className="block h-6 w-44 rounded bg-paper-deep" />
        <span className="block h-3 w-28 rounded bg-paper-deep" />
      </span>
    </div>
  )
}
