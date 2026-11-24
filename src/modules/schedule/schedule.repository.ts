import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/clients'
import type { BusyPeriod } from './domain/availability'

export const HOLIDAYS_TAG = 'holidays'

export type Holiday = { readonly date: string; readonly name: string }

export async function listHolidays(): Promise<Holiday[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(HOLIDAYS_TAG)

  const { data, error } = await createPublicClient()
    .from('holidays')
    .select('date, name')
    .order('date')
  if (error) throw new Error(`Failed to load holidays: ${error.message}`)
  return data
}

export async function listBusyPeriods(
  dentistIds: readonly string[],
  from: Date,
  to: Date,
): Promise<BusyPeriod[]> {
  if (dentistIds.length === 0) return []
  const { data, error } = await createPublicClient().rpc('get_busy_periods', {
    p_dentist_ids: [...dentistIds],
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  })
  if (error) throw new Error(`Failed to load busy periods: ${error.message}`)
  return data.map((row) => ({
    dentistId: row.dentist_id,
    start: new Date(row.starts_at),
    end: new Date(row.ends_at),
  }))
}
