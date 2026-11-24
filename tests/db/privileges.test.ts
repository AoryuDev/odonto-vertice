import { randomBytes, randomUUID } from 'node:crypto'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDentist, pool, removeTestDentist, SEED, type TestDentist } from './fixtures'

async function inRole<T>(
  role: 'service_role' | 'authenticated',
  claims: Record<string, string>,
  run: (query: typeof pool.query) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query(`set local role ${role}`)
    await client.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)])
    const result = await run(client.query.bind(client) as typeof pool.query)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

describe('privileges of the roles the app actually uses', () => {
  let dentist: TestDentist

  beforeEach(async () => {
    dentist = await createTestDentist()
  })

  afterEach(async () => {
    await removeTestDentist(dentist)
  })

  afterAll(async () => {
    await pool.end()
  })

  it('lets the service role book through book_appointment, trigger included', async () => {
    const id = await inRole('service_role', { role: 'service_role' }, async (query) => {
      const { rows } = await query<{ id: string }>(
        `select public.book_appointment($1, $2, $3, $4, 'Paciente Teste', $5, '+5562999990000', 'private', $6) as id`,
        [randomUUID(), dentist.id, SEED.evaluationTreatmentId, dentist.at('09:00'), `svc@${dentist.id}.test`, randomBytes(32)],
      )
      return rows[0]?.id
    })

    expect(id).toEqual(expect.any(String))
  })

  it('lets reception reschedule an appointment, running the slot rules as authenticated', async () => {
    const id = randomUUID()
    await pool.query(
      `select public.book_appointment($1, $2, $3, $4, 'Paciente Teste', $5, '+5562999990000', 'private', $6)`,
      [id, dentist.id, SEED.evaluationTreatmentId, dentist.at('09:00'), `rec@${dentist.id}.test`, randomBytes(32)],
    )

    const updated = await inRole(
      'authenticated',
      { sub: SEED.receptionUserId, role: 'authenticated' },
      async (query) => {
        const { rowCount } = await query(
          `update public.appointments
           set period = tstzrange($2::timestamptz, $2::timestamptz + interval '30 minutes', '[)')
           where id = $1`,
          [id, dentist.at('10:00')],
        )
        return rowCount
      },
    )

    expect(updated).toBe(1)
  })
})
