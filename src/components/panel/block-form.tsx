'use client'

import { useLocale } from 'next-intl'
import { useActionState, useEffect, useRef, useState } from 'react'
import { createBlock, type BlockFormState } from '@/app/[locale]/painel/(app)/actions'
import { Button } from '@/components/ui/button'
import { describedBy, Field, inputClasses } from '@/components/ui/field'
import { AlertIcon, CheckIcon } from '@/components/ui/icons'

type Option = { readonly id: string; readonly name: string }

export function BlockForm({
  dentists,
  fixedDentist,
  minDate,
}: {
  dentists: readonly Option[]
  fixedDentist?: Option
  minDate: string
}) {
  const locale = useLocale()
  const [state, action, pending] = useActionState<BlockFormState, FormData>(createBlock, {})
  const [allDay, setAllDay] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const errors = state.fieldErrors ?? {}

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={action} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="locale" value={locale} />
      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[0.8rem] bg-clay-100 p-3 text-sm text-clay-700 sm:col-span-2"
        >
          <AlertIcon size={18} className="mt-0.5 shrink-0" />
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-[0.8rem] bg-pine-100 p-3 text-sm text-pine-950 sm:col-span-2"
        >
          <CheckIcon size={18} />
          Bloqueio salvo. Os horários já sumiram do agendamento online.
        </p>
      ) : null}

      {fixedDentist ? (
        <input type="hidden" name="dentistId" value={fixedDentist.id} />
      ) : (
        <Field id="dentistId" label="Dentista" error={errors.dentistId}>
          <select
            id="dentistId"
            name="dentistId"
            required
            className={inputClasses}
            aria-invalid={Boolean(errors.dentistId)}
            aria-describedby={describedBy('dentistId', { error: Boolean(errors.dentistId) })}
            defaultValue=""
          >
            <option value="" disabled>
              Escolha
            </option>
            {dentists.map((dentist) => (
              <option key={dentist.id} value={dentist.id}>
                {dentist.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field id="date" label="Data" error={errors.date}>
        <input
          id="date"
          name="date"
          type="date"
          min={minDate}
          required
          className={inputClasses}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={describedBy('date', { error: Boolean(errors.date) })}
        />
      </Field>

      <label className="flex items-center gap-2 self-end pb-3 text-[0.95rem] text-ink sm:col-span-2">
        <input
          type="checkbox"
          name="allDay"
          checked={allDay}
          onChange={(event) => setAllDay(event.target.checked)}
          className="size-4 accent-pine-800"
        />
        Dia inteiro
      </label>

      {!allDay ? (
        <>
          <Field id="startTime" label="Das" error={errors.startTime}>
            <input
              id="startTime"
              name="startTime"
              type="time"
              step={900}
              required
              className={inputClasses}
              aria-invalid={Boolean(errors.startTime)}
              aria-describedby={describedBy('startTime', { error: Boolean(errors.startTime) })}
            />
          </Field>
          <Field id="endTime" label="Até" error={errors.endTime}>
            <input
              id="endTime"
              name="endTime"
              type="time"
              step={900}
              required
              className={inputClasses}
              aria-invalid={Boolean(errors.endTime)}
              aria-describedby={describedBy('endTime', { error: Boolean(errors.endTime) })}
            />
          </Field>
        </>
      ) : null}

      <div className="sm:col-span-2">
        <Field id="reason" label="Motivo" hint="Aparece só no painel." error={errors.reason}>
          <input
            id="reason"
            name="reason"
            required
            maxLength={140}
            placeholder="Ex.: curso de atualização"
            className={inputClasses}
            aria-invalid={Boolean(errors.reason)}
            aria-describedby={describedBy('reason', { hint: true, error: Boolean(errors.reason) })}
          />
        </Field>
      </div>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? 'Salvando…' : 'Bloquear horário'}
      </Button>
    </form>
  )
}
