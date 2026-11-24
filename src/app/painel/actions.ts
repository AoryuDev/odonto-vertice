'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSessionClient } from '@/lib/supabase/clients'

export type SignInState = { readonly error?: string; readonly email?: string }

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
})

export async function signIn(_state: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  const email = typeof formData.get('email') === 'string' ? String(formData.get('email')) : ''
  if (!parsed.success) return { error: 'Informe e-mail e senha.', email }

  const db = await createSessionClient()
  const { error } = await db.auth.signInWithPassword(parsed.data)
  if (error) {
    console.warn(`Failed panel sign-in (${error.status ?? 'unknown'})`)
    return {
      error:
        error.status === 429
          ? 'Muitas tentativas. Aguarde alguns minutos antes de tentar de novo.'
          : 'E-mail ou senha incorretos.',
      email,
    }
  }
  redirect('/painel')
}

export async function signOut(): Promise<void> {
  const db = await createSessionClient()
  await db.auth.signOut()
  redirect('/painel/login')
}
