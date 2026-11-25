'use server'

import { getTranslations } from 'next-intl/server'
import { z } from 'zod'
import { redirect } from '@/i18n/navigation'
import { formLocale, localeFrom } from '@/i18n/server'
import { createSessionClient } from '@/lib/supabase/clients'
import { getStaffSession } from '@/modules/admin/session'

export type SignInState = { readonly error?: string; readonly email?: string }

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
})

const PANEL_PATH = /^\/painel(?:\/[A-Za-z0-9/_-]*)?(?:\?[A-Za-z0-9=&%._:+-]*)?$/

export async function signIn(_state: SignInState, formData: FormData): Promise<SignInState> {
  const locale = formLocale(formData)
  const t = await getTranslations({ locale, namespace: 'panel.login.errors' })
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  const email = typeof formData.get('email') === 'string' ? String(formData.get('email')) : ''
  if (!parsed.success) return { error: t('invalid'), email }

  const db = await createSessionClient()
  const { data, error } = await db.auth.signInWithPassword(parsed.data)
  if (error) {
    console.warn(`Failed panel sign-in (${error.status ?? 'unknown'})`)
    return { error: error.status === 429 ? t('rateLimited') : t('wrong'), email }
  }

  const { data: profile } = await db
    .from('staff_profiles')
    .select('locale')
    .eq('user_id', data.user.id)
    .maybeSingle()
  return redirect({ href: '/painel', locale: profile?.locale ?? locale })
}

export async function signOut(formData: FormData): Promise<void> {
  const db = await createSessionClient()
  await db.auth.signOut()
  redirect({ href: '/painel/login', locale: formLocale(formData) })
}

export async function setStaffLocale(formData: FormData): Promise<void> {
  const locale = localeFrom(formData.get('locale'))
  const requested = String(formData.get('path') ?? '')
  const path = PANEL_PATH.test(requested) ? requested : '/painel'
  const session = await getStaffSession()
  if (session) {
    const { error } = await session.db
      .from('staff_profiles')
      .update({ locale })
      .eq('user_id', session.staff.userId)
    if (error) console.error(`Failed to save staff language: ${error.message}`)
  }
  redirect({ href: path, locale })
}
