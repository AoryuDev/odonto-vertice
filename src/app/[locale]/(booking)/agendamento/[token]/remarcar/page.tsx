import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { redirect } from '@/i18n/navigation'
import { currentLocale } from '@/i18n/server'
import { Suspense } from 'react'
import { LocaleField } from '@/components/site/locale-field'
import { rescheduleAppointment } from '@/app/[locale]/(booking)/agendamento/actions'
import { SlotPicker } from '@/components/booking/slot-picker'
import { StepHeading } from '@/components/booking/step-heading'
import { Button } from '@/components/ui/button'
import { AlertIcon, ArrowLeftIcon } from '@/components/ui/icons'
import { capitalize, formatLongDate, formatTime } from '@/lib/format'
import { buildSlotBoard } from '@/modules/booking/booking-view'
import { rescheduleContext } from '@/modules/booking/manage.service'
import { loadManageView, manageFailureFrom } from '@/modules/booking/manage-view'
import { listDentists } from '@/modules/catalog/catalog.repository'
import { isLocalDate, type LocalDate } from '@/modules/schedule/domain/clinic-time'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('reschedule')
  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
  }
}

type Props = {
  params: Promise<{ token: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function ReschedulePage(props: Props) {
  return (
    <div className="container-page py-10 md:py-16">
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="h-96 animate-pulse rounded-[var(--radius-card)] bg-paper-deep"
          />
        }
      >
        <RescheduleContent {...props} />
      </Suspense>
    </div>
  )
}

async function RescheduleContent({ params, searchParams }: Props) {
  const locale = await currentLocale()
  const [{ token }, query, t, tManage, tSummary] = await Promise.all([
    params,
    searchParams,
    getTranslations({ locale, namespace: 'reschedule' }),
    getTranslations({ locale, namespace: 'manage' }),
    getTranslations({ locale, namespace: 'booking.summary' }),
  ])
  const view = await loadManageView(token, locale)
  if (!view) notFound()
  if (!view.canManage)
    redirect({
      href: `/agendamento/${token}?erro=${view.appointment.status === 'scheduled' ? 'too_late' : 'not_scheduled'}`,
      locale,
    })

  const { appointment } = view
  const [context, dentists] = await Promise.all([
    rescheduleContext(appointment),
    listDentists(locale),
  ])
  if (!context) notFound()

  const requestedDate =
    typeof query.data === 'string' && isLocalDate(query.data)
      ? (query.data as LocalDate)
      : undefined
  const board = buildSlotBoard(
    context,
    dentists.filter((dentist) => dentist.id === appointment.dentist.id),
    requestedDate,
  )
  const selected =
    typeof query.horario === 'string'
      ? board.slots.find((slot) => slot.start === query.horario)
      : undefined
  const failure = manageFailureFrom(query.erro)
  const error = failure ? tManage(`errors.${failure}`) : undefined
  const base = `/agendamento/${token}/remarcar`

  return (
    <>
      <Link
        href={`/agendamento/${token}`}
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeftIcon size={16} />
        {t('back')}
      </Link>
      <div className="mt-6">
        <StepHeading title={t('title')}>
          {t('body', {
            treatment: appointment.treatment.name,
            dentist: appointment.dentist.displayName,
            date: formatLongDate(appointment.startsAt, locale),
            time: formatTime(appointment.startsAt, locale),
          })}
        </StepHeading>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-6 flex max-w-2xl items-start gap-3 rounded-[var(--radius-soft)] border border-clay-500/40 bg-clay-100 p-4"
        >
          <AlertIcon size={20} className="mt-0.5 shrink-0 text-clay-700" />
          <p>{error}</p>
        </div>
      ) : null}

      <SlotPicker
        board={board}
        selectedStart={selected?.start}
        hrefForDate={(date) => `${base}?data=${date}`}
        hrefForSlot={(slot) =>
          `${base}?data=${board.selectedDate}&horario=${encodeURIComponent(slot.start)}`
        }
      />

      {selected ? (
        <form
          action={rescheduleAppointment}
          className="sticky bottom-4 z-20 mt-10 flex flex-col gap-4 rounded-[var(--radius-card)] border border-pine-700 bg-card p-5 shadow-[0_20px_40px_-24px_rgba(21,58,47,0.5)] sm:flex-row sm:items-center sm:justify-between"
        >
          <LocaleField />
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="startsAt" value={selected.start} />
          <p className="text-ink">
            {t('newTime')}{' '}
            <strong className="font-semibold">
              {tSummary('whenValue', {
                date: capitalize(formatLongDate(new Date(selected.start), locale)),
                time: formatTime(new Date(selected.start), locale),
              })}
            </strong>
          </p>
          <Button type="submit">{t('confirm')}</Button>
        </form>
      ) : null}
    </>
  )
}
