import { randomBytes, randomUUID } from 'node:crypto'
import { Pool, type PoolClient } from 'pg'

export const pool = new Pool({
  connectionString:
    process.env.SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  max: 20,
})

export const SEED = {
  receptionUserId: '9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0001',
  helenaUserId: '9e1a4c55-3b2d-4f6e-8a90-1c2d3e4f0002',
  helenaDentistId: '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0001',
  rafaelDentistId: '0b3f7c1e-4a51-4c1f-9a51-2f1d1e6a0002',
  evaluationTreatmentId: '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0001',
  cleaningTreatmentId: '5d1c2b9a-7e40-4b8e-8c11-6a2f0c3b0002',
} as const

export type TestDentist = {
  id: string
  date: string
  at: (localTime: string) => string
}

export async function findOpenDate(daysAhead: number): Promise<string> {
  const { rows } = await pool.query<{ date: string }>(
    `select to_char(d, 'YYYY-MM-DD') as date
     from generate_series(
       (now() at time zone 'America/Sao_Paulo')::date + $1::int,
       (now() at time zone 'America/Sao_Paulo')::date + $1::int + 30,
       interval '1 day'
     ) as d
     where not exists (select 1 from public.holidays h where h.date = d::date)
     limit 1`,
    [daysAhead],
  )
  const first = rows[0]
  if (!first) throw new Error('No open date found')
  return first.date
}

export async function createTestDentist(daysAhead = 200): Promise<TestDentist> {
  const id = randomUUID()
  const suffix = id.slice(0, 8)
  const date = await findOpenDate(daysAhead)
  await pool.query(
    `insert into public.dentists
       (id, slug, full_name, display_name, specialty, cro_registration, headline, bio, photo_key)
     values ($1, $2, 'Test Dentist', 'Dr. Test', 'general_dentistry', $3, 'Test', array['Test'], 'test')`,
    [
      id,
      `test-${suffix}`,
      `CRO-GO ${String(Number.parseInt(suffix, 16) % 900000).padStart(6, '1')}`,
    ],
  )
  await pool.query(
    `insert into public.weekly_schedules (dentist_id, weekday, starts_at, ends_at, lunch_starts_at, lunch_ends_at)
     select $1, w, '08:00', '18:00', '12:00', '13:00' from generate_series(0, 6) as w`,
    [id],
  )
  await pool.query(
    `insert into public.dentist_treatments (dentist_id, treatment_id) values ($1, $2), ($1, $3)`,
    [id, SEED.evaluationTreatmentId, SEED.cleaningTreatmentId],
  )
  return {
    id,
    date,
    at: (localTime) => toInstant(date, localTime),
  }
}

export async function removeTestDentist(dentist: TestDentist): Promise<void> {
  await pool.query(
    `delete from public.notification_deliveries nd using public.appointments a
     where nd.appointment_id = a.id and a.dentist_id = $1`,
    [dentist.id],
  )
  await pool.query(`delete from public.appointments where dentist_id = $1`, [dentist.id])
  await pool.query(`delete from public.patients where email like $1`, [`%@${dentist.id}.test`])
  await pool.query(`delete from public.dentists where id = $1`, [dentist.id])
}

export function toInstant(date: string, localTime: string): string {
  return `${date}T${localTime}:00-03:00`
}

export function tokenHash(): Buffer {
  return randomBytes(32)
}

export type BookInput = {
  dentistId: string
  treatmentId?: string
  startsAt: string
  patientEmail?: string
}

export async function book(
  input: BookInput,
  client: Pick<PoolClient, 'query'> = pool,
): Promise<string> {
  const { rows } = await client.query<{ id: string }>(
    `select public.book_appointment(gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'private', $7) as id`,
    [
      input.dentistId,
      input.treatmentId ?? SEED.evaluationTreatmentId,
      input.startsAt,
      'Paciente de Teste',
      input.patientEmail ?? `p-${randomUUID().slice(0, 8)}@${input.dentistId}.test`,
      '+5562999990000',
      tokenHash(),
    ],
  )
  const row = rows[0]
  if (!row) throw new Error('book_appointment returned no row')
  return row.id
}

export function sqlState(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : undefined
}

export function sqlMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
