'use client'

import { useActionState } from 'react'
import { signIn, type SignInState } from '@/app/painel/actions'
import { Button } from '@/components/ui/button'
import { Field, inputClasses } from '@/components/ui/field'
import { AlertIcon } from '@/components/ui/icons'

export function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {})

  return (
    <form action={action} className="space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[0.8rem] bg-clay-100 p-3 text-sm text-clay-700"
        >
          <AlertIcon size={18} className="mt-0.5 shrink-0" />
          {state.error}
        </p>
      ) : null}
      <Field id="email" label="E-mail">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className={inputClasses}
        />
      </Field>
      <Field id="password" label="Senha">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClasses}
        />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}
