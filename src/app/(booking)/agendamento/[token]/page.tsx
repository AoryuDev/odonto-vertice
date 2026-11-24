import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { cancelAppointment } from '@/app/(booking)/agendamento/actions'
import { BookingSummary } from '@/components/booking/booking-summary'
import { Button, ButtonLink } from '@/components/ui/button'
import { AlertIcon, CalendarIcon, CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { clinic, directionsUrl } from '@/modules/catalog/clinic'
import { loadManageView, MANAGE_ERRORS } from '@/modules/booking/manage-view'

export const metadata: Metadata = {
  title: 'Seu agendamento',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
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

const STATUS_COPY = {
  scheduled: { label: 'Confirmada', tone: 'bg-pine-100 text-pine-900' },
  cancelled: { label: 'Cancelada', tone: 'bg-clay-100 text-clay-700' },
  completed: { label: 'Realizada', tone: 'bg-paper-deep text-ink' },
  no_show: { label: 'Não compareceu', tone: 'bg-paper-deep text-ink' },
} as const

async function ManageContent({ params, searchParams }: Props) {
  const [{ token }, query] = await Promise.all([params, searchParams])
  const view = await loadManageView(token)
  if (!view) notFound()

  const { appointment, canManage, isPast } = view
  const status = STATUS_COPY[appointment.status]
  const error = typeof query.erro === 'string' ? MANAGE_ERRORS[query.erro] : undefined
  const banner = query.novo
    ? {
        title: 'Consulta confirmada',
        body: `Enviamos os detalhes para ${appointment.patient.email}. Guarde este link para remarcar ou cancelar.`,
      }
    : query.remarcada
      ? {
          title: 'Consulta remarcada',
          body: 'O novo horário já está na agenda e a confirmação foi enviada por e-mail.',
        }
      : query.cancelada
        ? {
            title: 'Consulta cancelada',
            body: 'O horário foi liberado. Se quiser, agende de novo quando for melhor para você.',
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
          <h2 className="text-title text-ink">Seu agendamento</h2>
        ) : (
          <h1 className="text-title text-ink">Seu agendamento</h1>
        )}
        <span className={cn('rounded-full px-3 py-1 text-sm font-medium', status.tone)}>
          {status.label}
        </span>
      </div>
      <p className="mt-2 text-ink-soft">
        Olá, {appointment.patient.fullName.split(' ')[0]}. Estes são os detalhes da sua consulta.
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
            Adicionar à agenda
          </ButtonLink>
          <ButtonLink
            href={directionsUrl()}
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Como chegar
          </ButtonLink>
        </div>
      ) : null}

      {appointment.status === 'scheduled' && canManage ? (
        <section aria-labelledby="mudar-titulo" className="mt-12 border-t border-line pt-10">
          <h2 id="mudar-titulo" className="text-subtitle text-ink">
            Precisa mudar?
          </h2>
          <p className="mt-2 text-ink-soft">
            Você pode remarcar ou cancelar por aqui até duas horas antes do horário.
          </p>
          <div className="mt-6 flex flex-wrap items-start gap-3">
            <ButtonLink href={`/agendamento/${token}/remarcar`}>Remarcar</ButtonLink>
            <details className="group">
              <summary className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-[0.95rem] font-medium text-ink hover:border-ink">
                Cancelar consulta
              </summary>
              <form
                action={cancelAppointment}
                className="mt-4 w-full max-w-md rounded-[var(--radius-soft)] border border-line bg-card p-5"
              >
                <input type="hidden" name="token" value={token} />
                <label htmlFor="reason" className="text-[0.95rem] font-medium text-ink">
                  Quer contar o motivo?{' '}
                  <span className="font-normal text-ink-soft">(opcional)</span>
                </label>
                <select
                  id="reason"
                  name="reason"
                  className="mt-2 block w-full rounded-[0.8rem] border border-line-strong bg-paper px-3 py-2.5"
                  defaultValue=""
                >
                  <option value="">Prefiro não dizer</option>
                  <option value="Conflito de horário">Conflito de horário</option>
                  <option value="Resolvi em outro lugar">Resolvi em outro lugar</option>
                  <option value="Problema de saúde">Problema de saúde</option>
                  <option value="Questão financeira">Questão financeira</option>
                </select>
                <Button type="submit" className="mt-4 bg-clay-600 text-paper hover:bg-clay-700">
                  Sim, cancelar consulta
                </Button>
              </form>
            </details>
          </div>
        </section>
      ) : null}

      {appointment.status === 'scheduled' && !canManage && !isPast ? (
        <p className="mt-10 rounded-[var(--radius-soft)] border border-line bg-card p-5 text-ink-soft">
          Faltam menos de duas horas para a consulta. Para remarcar ou cancelar, ligue para{' '}
          <a
            href={`tel:${clinic.phone.e164}`}
            className="font-medium text-pine-800 underline underline-offset-4"
          >
            {clinic.phone.display}
          </a>
          .
        </p>
      ) : null}

      {appointment.status !== 'scheduled' ? (
        <div className="mt-10">
          <ButtonLink href={`/agendar?tratamento=${appointment.treatment.slug}`}>
            Agendar outro horário
          </ButtonLink>
        </div>
      ) : null}

      <p className="mt-12 text-sm text-ink-soft">
        Dúvidas? Fale com a recepção pelo{' '}
        <a href={`tel:${clinic.phone.e164}`} className="underline underline-offset-4">
          {clinic.phone.display}
        </a>{' '}
        ou volte para o{' '}
        <Link href="/" className="underline underline-offset-4">
          site
        </Link>
        .
      </p>
    </div>
  )
}
