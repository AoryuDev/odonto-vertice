import 'server-only'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { cache } from 'react'
import { createSessionClient, type Db } from '@/lib/supabase/clients'
import type { Database } from '@/lib/supabase/database.types'

export type StaffRole = Database['public']['Enums']['staff_role']

export type Staff = {
  readonly userId: string
  readonly fullName: string
  readonly role: StaffRole
  readonly dentistId: string | null
}

export type StaffSession = { readonly staff: Staff; readonly db: Db }

export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  await connection()
  const db = await createSessionClient()
  const {
    data: { user },
  } = await db.auth.getUser()
  if (!user) return null

  const { data: profile } = await db
    .from('staff_profiles')
    .select('user_id, full_name, role, dentist_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile) return null

  return {
    db,
    staff: {
      userId: profile.user_id,
      fullName: profile.full_name,
      role: profile.role,
      dentistId: profile.dentist_id,
    },
  }
})

export async function requireStaff(): Promise<StaffSession> {
  const session = await getStaffSession()
  if (!session) redirect('/painel/login')
  return session
}

export function canManageDentist(staff: Staff, dentistId: string): boolean {
  return staff.role === 'reception' || staff.dentistId === dentistId
}
