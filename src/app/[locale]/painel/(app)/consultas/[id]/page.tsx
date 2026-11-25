import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { LocaleField } from '@/components/site/locale-field'
import {
  cancelAppointmentAsStaff,
  rescheduleAppointmentAsStaff,
  setAttendance,
} from '@/app/[locale]/painel/(app)/actions'
import { SlotPicker } from '@/components/booking/slot-picker'
import { Button } from '@/components/ui/button'
import { inputClasses } from '@/components/ui/field'
import { AlertIcon, ArrowLeftIcon, CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { capitalize, formatLongDate, formatShortDate, formatTime } from '@/lib/format'
import { agendaHref } from '@/modules/admin/agenda-params'
import { findStaffAppointment } from '@/modules/admin/agenda.repository'
import { appointmentIdSchema } from '@/modules/admin/schemas'
import { currentLocale } from '@/i18n/server'
import { parseCancellationNote } from '@/modules/booking/cancellation'
import { requireStaff } from '@/modules/admin/session'
import { buildSlotBoard } from '@/modules/booking/booking-view'
import { noticeDelivery } from '@/modules/notifications/channel'
import { rescheduleContext } from '@/modules/booking/manage.service'
import { listDentists } from '@/modules/catalog/catalog.repository'
import { formatBrazilianPhone, whatsappLinkFor } from '@/modules/patients/phone'
import { staffPolicy } from '@/modules/schedule/availability.service'
import { isLocalDate, toLocalDate, type LocalDate } from '@/modules/schedule/domain/clinic-time'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('panel.meta')
  return { title: t('appointment') }
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const FLASH_TONES = {
  cancelada: 'ok',
  remarcada: 'ok',
  presenca: 'ok',
  status: 'error',
  horario: 'error',
  falha: 'error',
} as const

type FlashKey = keyof typeof FLASH_TONES

function flashKeyFrom(value: unknown): FlashKey | undefined {
  return typeof value === 'string' && value in FLASH_TONES ? (value as FlashKey) : undefined
}

export default function AppointmentPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="h-96 animate-pulse rounded-[var(--radius-card)] bg-paper-deep"
        />
      }
    >
      <AppointmentContent {...props} />
    </Suspense>
  )
}

async function AppointmentContent({ params, searchParams }: Props) {
  const locale = await currentLocale()
  const [{ db }, { id }, query] = await Promise.all([requireStaff(locale), params, searchParams])
  if (!appointmentIdSchema.safeParse(id).success) notFound()
  const appointment = await findStaffAppointment(db, id, locale)
  if (!appointment) notFound()

  const [t, tCancellation] = await Promise.all([
    getTranslations({ locale, namespace: 'panel' }),
    getTranslations({ locale, namespace: 'cancellationReasons' }),
  ])
  const cancellationLabel = (value: string) => {
    const note = parseCancellationNote(value)
    return note.kind === 'staff' ? note.text : tCancellation(note.reason ?? 'patient')
  }

  await connection()
  const now = new Date()
  const isFuture = appointment.start.getTime() > now.getTime()
  const date = toLocalDate(appointment.start, CLINIC_TIME_ZONE)
  const flashKey = flashKeyFrom(query.ok) ?? flashKeyFrom(query.erro)
  const flash = flashKey
    ? {
        tone: FLASH_TONES[flashKey],
        text: t(`appointment.flash.${flashKey}`, { delivery: noticeDelivery() }),
      }
    : undefined
  const canReschedule = appointment.status === 'scheduled' && isFuture

  const board = canReschedule
    ? await (async () => {
        const [context, dentists] = await Promise.all([
          rescheduleContext(
            {
              treatment: appointment.treatment,
              dentist: appointment.dentist,
              startsAt: appointment.start,
              endsAt: appointment.end,
            },
            staffPolicy,
          ),
          listDentists(locale),
        ])
        if (!context) return undefined
        const requested =
          typeof query.data === 'string' && isLocalDate(query.data)
            ? (query.data as LocalDate)
            : date
        return buildSlotBoard(
          context,
          dentists.filter((dentist) => dentist.id === appointment.dentistId),
          requested,
        )
      })()
    : undefined
  const selectedStart =
    typeof query.horario === 'string'
      ? board?.slots.find((slot) => slot.start === query.horario)?.start
      : undefined
  const base = `/painel/consultas/${appointment.id}`

  return (
    <div className="max-w-5xl space-y-8">
      <Link
        href={agendaHref({ date })}
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeftIcon size={16} />
        {t('appointment.back', { date: formatShortDate(appointment.start, locale) })}
      </Link>

      {flash ? (
        <p
          role={flash.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'flex items-start gap-2 rounded-[var(--radius-soft)] p-4',
            flash.tone === 'ok' ? 'bg-pine-100 text-pine-950' : 'bg-clay-100 text-clay-700',
          )}
        >
          {flash.tone === 'ok' ? (
            <CheckIcon size={20} className="mt-0.5 shrink-0" />
          ) : (
            <AlertIcon size={20} className="mt-0.5 shrink-0" />
          )}
          {flash.text}
        </p>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">
            {t('appointment.summary', {
              treatment: appointment.treatmentName,
              dentist: appointment.dentist.displayName,
            })}
          </p>
          <h1 className="mt-1 font-display text-[2.2rem] leading-tight text-ink">
            {appointment.patient.fullName}
          </h1>
          <p className="mt-2 text-lg text-ink">
            {capitalize(formatLongDate(appointment.start, locale))},{' '}
            {formatTime(appointment.start, locale)}–{formatTime(appointment.end, locale)}
          </p>
        </div>
        <span className="rounded-full bg-paper-deep px-3 py-1 text-sm font-medium text-ink">
          {t(`status.${appointment.status}`)}
        </span>
      </header>

      <dl className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {[
          [
            t('appointment.fields.phone'),
            <a
              key="t"
              href={`tel:${appointment.patient.phone}`}
              className="tabular underline underline-offset-4"
            >
              {formatBrazilianPhone(appointment.patient.phone)}
            </a>,
          ],
          [
            t('appointment.fields.email'),
            <a
              key="e"
              href={`mailto:${appointment.patient.email}`}
              className="break-all underline underline-offset-4"
            >
              {appointment.patient.email}
            </a>,
          ],
          [
            t('appointment.fields.whatsapp'),
            <a
              key="w"
              href={whatsappLinkFor(appointment.patient.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {t('appointment.fields.openChat')}
            </a>,
          ],
          [
            t('appointment.fields.payment'),
            appointment.paymentMethod === 'insurance'
              ? t('appointment.fields.insurance', {
                  provider: appointment.insuranceProvider ?? '',
                })
              : t('appointment.fields.private'),
          ],
          [
            t('appointment.fields.source'),
            appointment.source === 'website'
              ? t('appointment.fields.website')
              : t('appointment.fields.reception'),
          ],
          [t('appointment.fields.reschedules'), String(appointment.rescheduledCount)],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-card p-4">
            <dt className="text-sm text-ink-soft">{label}</dt>
            <dd className="mt-1 text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {appointment.notes ? (
        <section className="rounded-[var(--radius-soft)] border-l-4 border-clay-500 bg-card p-4">
          <h2 className="text-sm font-semibold text-ink">{t('appointment.notes')}</h2>
          <p className="mt-1 whitespace-pre-line text-ink-soft">{appointment.notes}</p>
        </section>
      ) : null}
      {appointment.cancellationReason ? (
        <p className="text-ink-soft">
          {t('appointment.cancellationReason', {
            reason: cancellationLabel(appointment.cancellationReason),
          })}
        </p>
      ) : null}

      {appointment.status !== 'cancelled' && !isFuture ? (
        <section
          aria-labelledby="presenca"
          className="rounded-[var(--radius-card)] border border-line bg-card p-5"
        >
          <h2 id="presenca" className="font-display text-xl text-ink">
            {t('appointment.attendance')}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ['completed', t('appointment.attended')],
                ['no_show', t('appointment.noShow')],
              ] as const
            ).map(([status, label]) => (
              <form key={status} action={setAttendance}>
                <LocaleField />
                <input type="hidden" name="id" value={appointment.id} />
                <input type="hidden" name="status" value={status} />
                <Button
                  type="submit"
                  variant={appointment.status === status ? 'primary' : 'secondary'}
                >
                  {label}
                </Button>
              </form>
            ))}
          </div>
        </section>
      ) : null}

      {canReschedule && board ? (
        <section
          aria-labelledby="remarcar"
          className="rounded-[var(--radius-card)] border border-line bg-card p-5 md:p-6"
        >
          <h2 id="remarcar" className="font-display text-xl text-ink">
            {t('appointment.reschedule')}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {t('appointment.rescheduleBody', { dentist: appointment.dentist.displayName })}
          </p>
          <SlotPicker
            board={board}
            selectedStart={selectedStart}
            hrefForDate={(day) => `${base}?data=${day}#remarcar`}
            hrefForSlot={(slot) =>
              `${base}?data=${board.selectedDate}&horario=${encodeURIComponent(slot.start)}#remarcar`
            }
          />
          {selectedStart ? (
            <form
              action={rescheduleAppointmentAsStaff}
              className="mt-6 flex flex-wrap items-center gap-4"
            >
              <LocaleField />
              <input type="hidden" name="id" value={appointment.id} />
              <input type="hidden" name="startsAt" value={selectedStart} />
              <p>
                {t('appointment.newTime')}{' '}
                <strong>
                  {capitalize(formatLongDate(new Date(selectedStart), locale))},{' '}
                  {formatTime(new Date(selectedStart), locale)}
                </strong>
              </p>
              <Button type="submit">{t('appointment.confirmReschedule')}</Button>
            </form>
          ) : null}
        </section>
      ) : null}

      {appointment.status === 'scheduled' ? (
        <section
          aria-labelledby="cancelar"
          className="rounded-[var(--radius-card)] border border-line bg-card p-5 md:p-6"
        >
          <h2 id="cancelar" className="font-display text-xl text-ink">
            {t('appointment.cancelTitle')}
          </h2>
          <form action={cancelAppointmentAsStaff} className="mt-4 grid max-w-xl gap-4">
            <LocaleField />
            <input type="hidden" name="id" value={appointment.id} />
            <div>
              <label htmlFor="reason" className="text-[0.95rem] font-medium text-ink">
                {t('appointment.reason')}
              </label>
              <input
                id="reason"
                name="reason"
                required
                minLength={3}
                maxLength={280}
                className={cn(inputClasses, 'mt-2')}
                placeholder={t('appointment.reasonPlaceholder')}
              />
            </div>
            <label className="flex items-center gap-2 text-[0.95rem] text-ink">
              <input
                type="checkbox"
                name="notify"
                defaultChecked
                className="size-4 accent-pine-800"
              />
              {t('appointment.notify')}
            </label>
            <Button type="submit" className="w-fit bg-clay-600 text-paper hover:bg-clay-700">
              {t('appointment.cancelSubmit')}
            </Button>
          </form>
        </section>
      ) : null}
    </div>
  )
}
