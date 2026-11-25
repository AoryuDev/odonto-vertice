import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { LocaleField } from '@/components/site/locale-field'
import { cancelAppointment } from '@/app/[locale]/(booking)/agendamento/actions'
import { BookingSummary } from '@/components/booking/booking-summary'
import { Button, ButtonLink } from '@/components/ui/button'
import { AlertIcon, CalendarIcon, CheckIcon } from '@/components/ui/icons'
import { currentLocale } from '@/i18n/server'
import { cn } from '@/lib/cn'
import { PATIENT_CANCELLATION_REASONS } from '@/modules/booking/schemas'
import { clinic, directionsUrl } from '@/modules/catalog/clinic'
import { loadManageView, manageFailureFrom } from '@/modules/booking/manage-view'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('manage')
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

export default function ManagePage(props: Props) {
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
        <ManageContent {...props} />
      </Suspense>
    </div>
  )
}

const STATUS_TONES = {
  scheduled: 'bg-pine-100 text-pine-900',
  cancelled: 'bg-clay-100 text-clay-700',
  completed: 'bg-paper-deep text-ink',
  no_show: 'bg-paper-deep text-ink',
} as const

async function ManageContent({ params, searchParams }: Props) {
  const locale = await currentLocale()
  const [{ token }, query, t] = await Promise.all([
    params,
    searchParams,
    getTranslations({ locale, namespace: 'manage' }),
  ])
  const view = await loadManageView(token, locale)
  if (!view) notFound()

  const { appointment, canManage, isPast } = view
  const failure = manageFailureFrom(query.erro)
  const error = failure ? t(`errors.${failure}`) : undefined
  const bannerKey = query.novo
    ? 'booked'
    : query.remarcada
      ? 'rescheduled'
      : query.cancelada
        ? 'cancelled'
        : undefined
  const banner = bannerKey
    ? {
        title: t(`banners.${bannerKey}.title`),
        body: t(`banners.${bannerKey}.body`, { email: appointment.patient.email }),
      }
    : undefined

  return (
    <div className="mx-auto max-w-3xl">
      {banner ? (
        <div
          role="status"
          className="mb-10 flex items-start gap-4 rounded-[var(--radius-card)] bg-pine-800 p-6 text-paper"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-paper text-pine-800">
            <CheckIcon size={22} />
          </span>
          <div>
            <h1 className="font-display text-subtitle">{banner.title}</h1>
            <p className="mt-1 text-pine-100">{banner.body}</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 rounded-[var(--radius-soft)] border border-clay-500/40 bg-clay-100 p-4"
        >
          <AlertIcon size={20} className="mt-0.5 shrink-0 text-clay-700" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        {banner ? (
          <h2 className="text-title text-ink">{t('title')}</h2>
        ) : (
          <h1 className="text-title text-ink">{t('title')}</h1>
        )}
        <span
          className={cn(
            'rounded-full px-3 py-1 text-sm font-medium',
            STATUS_TONES[appointment.status],
          )}
        >
          {t(`status.${appointment.status}`)}
        </span>
      </div>
      <p className="mt-2 text-ink-soft">
        {t('greeting', { name: appointment.patient.fullName.split(' ')[0] ?? '' })}
      </p>

      <div className="mt-8">
        <BookingSummary
          treatmentName={appointment.treatment.name}
          durationMinutes={Math.round(
            (appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60000,
          )}
          dentistLabel={appointment.dentist.displayName}
          startsAt={appointment.startsAt}
        />
      </div>

      {appointment.status === 'scheduled' && !isPast ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink
            href={`/agendamento/${token}/calendario`}
            variant="secondary"
            prefetch={false}
          >
            <CalendarIcon size={18} />
            {t('addToCalendar')}
          </ButtonLink>
          <ButtonLink
            href={directionsUrl()}
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('directions')}
          </ButtonLink>
        </div>
      ) : null}

      {appointment.status === 'scheduled' && canManage ? (
        <section aria-labelledby="mudar-titulo" className="mt-12 border-t border-line pt-10">
          <h2 id="mudar-titulo" className="text-subtitle text-ink">
            {t('changeTitle')}
          </h2>
          <p className="mt-2 text-ink-soft">{t('changeBody')}</p>
          <div className="mt-6 flex flex-wrap items-start gap-3">
            <ButtonLink href={`/agendamento/${token}/remarcar`}>{t('reschedule')}</ButtonLink>
            <details className="group">
              <summary className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-[0.95rem] font-medium text-ink hover:border-ink">
                {t('cancel')}
              </summary>
              <form
                action={cancelAppointment}
                className="mt-4 w-full max-w-md rounded-[var(--radius-soft)] border border-line bg-card p-5"
              >
                <LocaleField />
                <input type="hidden" name="token" value={token} />
                <label htmlFor="reason" className="text-[0.95rem] font-medium text-ink">
                  {t('reasonLabel')}{' '}
                  <span className="font-normal text-ink-soft">{t('optional')}</span>
                </label>
                <select
                  id="reason"
                  name="reason"
                  className="mt-2 block w-full rounded-[0.8rem] border border-line-strong bg-paper px-3 py-2.5"
                  defaultValue=""
                >
                  <option value="">{t('reasons.none')}</option>
                  {PATIENT_CANCELLATION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {t(`reasons.${reason}`)}
                    </option>
                  ))}
                </select>
                <Button type="submit" className="mt-4 bg-clay-600 text-paper hover:bg-clay-700">
                  {t('confirmCancel')}
                </Button>
              </form>
            </details>
          </div>
        </section>
      ) : null}

      {appointment.status === 'scheduled' && !canManage && !isPast ? (
        <p className="mt-10 rounded-[var(--radius-soft)] border border-line bg-card p-5 text-ink-soft">
          {t.rich('tooLate', {
            phone: clinic.phone.display,
            phoneLink: (chunks) => (
              <a
                href={`tel:${clinic.phone.e164}`}
                className="font-medium text-pine-800 underline underline-offset-4"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      ) : null}

      {appointment.status !== 'scheduled' ? (
        <div className="mt-10">
          <ButtonLink href={`/agendar/${appointment.treatment.slug}`}>{t('bookAgain')}</ButtonLink>
        </div>
      ) : null}

      <p className="mt-12 text-sm text-ink-soft">
        {t.rich('help', {
          phone: clinic.phone.display,
          phoneLink: (chunks) => (
            <a href={`tel:${clinic.phone.e164}`} className="underline underline-offset-4">
              {chunks}
            </a>
          ),
          site: (chunks) => (
            <Link href="/" className="underline underline-offset-4">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  )
}
