import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { serverEnv } from '@/lib/env'
import type { Database } from './database.types'

export type Db = SupabaseClient<Database>

const statelessAuth = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }

export function createPublicClient(): Db {
  const env = serverEnv()
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: statelessAuth,
  })
}

export function createServiceClient(): Db {
  const env = serverEnv()
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: statelessAuth,
  })
}

export async function createSessionClient(): Promise<Db> {
  const env = serverEnv()
  const cookieStore = await cookies()
  return createServerClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (entries) => {
        try {
          for (const { name, value, options } of entries) cookieStore.set(name, value, options)
        } catch {
          return
        }
      },
    },
  })
}
