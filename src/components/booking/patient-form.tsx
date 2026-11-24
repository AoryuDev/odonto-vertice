'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale } from 'next-intl'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { submitBooking, type BookingActionResult } from '@/app/[locale]/(booking)/agendar/actions'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import { describedBy, Field, FieldError, inputClasses } from '@/components/ui/field'
import { AlertIcon } from '@/components/ui/icons'
import { cn } from '@/lib/cn'
import { formatTime, formatWeekdayShort } from '@/lib/format'
import {
  patientDetailsSchema,
  type PatientDetails,
  type PatientDetailsInput,
} from '@/modules/booking/schemas'
import { bookingHref } from '@/modules/booking/booking-routes'
import { maskBrazilianPhoneInput } from '@/modules/patients/phone'
import { toLocalDate } from '@/modules/schedule/domain/clinic-time'
import { CLINIC_TIME_ZONE } from '@/modules/schedule/domain/policy'

type PatientFormProps = {
  readonly treatmentSlug: string
  readonly dentistSlug: string
  readonly startsAt: string
}

const FIELD_ORDER = [
  'fullName',
  'email',
  'phone',
  'paymentMethod',
  'insuranceProvider',
  'notes',
  'consent',
] as const

export function PatientForm({ treatmentSlug, dentistSlug, startsAt }: PatientFormProps) {
  const router = useRouter()
  const locale = useLocale()
  const [submission, setSubmission] = useState<{
    startsAt: string
    result: BookingActionResult
  } | null>(null)
  const result = submission?.startsAt === startsAt ? submission.result : null
  const [pending, startTransition] = useTransition()
  const alertRef = useRef<HTMLDivElement>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm<PatientDetailsInput, unknown, PatientDetails>({
    resolver: zodResolver(patientDetailsSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      paymentMethod: 'private',
      insuranceProvider: '',
      notes: '',
      company: '',
    },
  })

  useEffect(() => {
    if (result) alertRef.current?.focus()
  }, [result])

  const paymentMethod = useWatch({ control, name: 'paymentMethod' })

  const onSubmit = handleSubmit(() => {
    startTransition(async () => {
      const response = await submitBooking({
        slot: { treatmentSlug, dentistSlug, startsAt },
        patient: getValues(),
        locale,
      })
      setSubmission({ startsAt, result: response })
      for (const field of FIELD_ORDER) {
        const message = response.fieldErrors?.[field]
        if (message) setError(field, { type: 'server', message })
      }
    })
  })

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-6"
      aria-describedby={result ? 'booking-alert' : undefined}
    >
      {result ? (
        <div
          ref={alertRef}
          id="booking-alert"
          role="alert"
          tabIndex={-1}
          className="rounded-[var(--radius-soft)] border border-clay-500/40 bg-clay-100 p-4 text-ink focus:outline-none"
        >
          <p className="flex items-start gap-2 font-medium">
            <AlertIcon size={20} className="mt-0.5 shrink-0 text-clay-700" />
            {result.message}
          </p>
          {result.alternatives && result.alternatives.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2 pl-7">
              {result.alternatives.map((start) => (
                <li key={start}>
                  <button
                    type="button"
                    onClick={() =>
                      router.replace(
                        bookingHref({
                          treatment: treatmentSlug,
                          dentist: dentistSlug,
                          date: toLocalDate(new Date(start), CLINIC_TIME_ZONE),
                          start,
                        }),
                        { scroll: false },
                      )
                    }
                    className="rounded-full border border-pine-800 bg-card px-4 py-2 text-sm font-medium text-pine-800 tabular hover:bg-pine-800 hover:text-paper"
                  >
                    {formatWeekdayShort(new Date(start), locale)}{' '}
                    {formatTime(new Date(start), locale)}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Field id="fullName" label="Nome completo" error={errors.fullName?.message}>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={describedBy('fullName', { error: Boolean(errors.fullName) })}
          className={inputClasses}
          {...register('fullName')}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="email"
          label="E-mail"
          hint="A confirmação e o link para remarcar chegam aqui."
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email', { hint: true, error: Boolean(errors.email) })}
            className={inputClasses}
            {...register('email')}
          />
        </Field>

        <Field
          id="phone"
          label="Celular com DDD"
          hint="Só ligamos se precisar mudar algo."
          error={errors.phone?.message}
        >
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="(62) 90000-0000"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy('phone', {
                  hint: true,
                  error: Boolean(errors.phone),
                })}
                className={inputClasses}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(maskBrazilianPhoneInput(event.target.value))}
              />
            )}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-[0.95rem] font-medium text-ink">Como você vai pagar?</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              ['private', 'Particular'],
              ['insurance', 'Convênio'],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-[0.8rem] border bg-card px-4 py-3 transition-colors',
                paymentMethod === value
                  ? 'border-pine-800 ring-1 ring-pine-800'
                  : 'border-line-strong hover:border-ink-soft',
              )}
            >
              <input
                type="radio"
                value={value}
                className="size-4 accent-pine-800"
                {...register('paymentMethod')}
              />
              {label}
            </label>
          ))}
        </div>
        {errors.paymentMethod?.message ? (
          <FieldError id="paymentMethod-error">{errors.paymentMethod.message}</FieldError>
        ) : null}
      </fieldset>

      {paymentMethod === 'insurance' ? (
        <Field
          id="insuranceProvider"
          label="Nome do convênio"
          hint="A recepção confere a cobertura antes da consulta."
          error={errors.insuranceProvider?.message}
        >
          <input
            id="insuranceProvider"
            type="text"
            autoComplete="off"
            aria-invalid={Boolean(errors.insuranceProvider)}
            aria-describedby={describedBy('insuranceProvider', {
              hint: true,
              error: Boolean(errors.insuranceProvider),
            })}
            className={inputClasses}
            {...register('insuranceProvider')}
          />
        </Field>
      ) : null}

      <Field
        id="notes"
        label="Algo que o dentista deva saber?"
        optional
        hint="Ex.: sensibilidade, medo de agulha, uso de anticoagulante, gestação."
        error={errors.notes?.message}
      >
        <textarea
          id="notes"
          rows={3}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={describedBy('notes', { hint: true, error: Boolean(errors.notes) })}
          className={cn(inputClasses, 'resize-y')}
          {...register('notes')}
        />
      </Field>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Empresa</label>
        <input id="company" type="text" tabIndex={-1} autoComplete="off" {...register('company')} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] text-ink">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-pine-800"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            {...register('consent')}
          />
          <span>
            Autorizo a Odonto Vértice a usar meus dados para este agendamento e para lembretes da
            consulta, conforme a LGPD.
          </span>
        </label>
        {errors.consent?.message ? (
          <FieldError id="consent-error">{errors.consent.message}</FieldError>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? 'Confirmando…' : 'Confirmar agendamento'}
      </Button>
    </form>
  )
}
