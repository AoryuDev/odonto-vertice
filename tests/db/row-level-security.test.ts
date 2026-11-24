import { afterAll, describe, expect, it } from 'vitest'
import { pool, SEED, sqlState } from './fixtures'

const PERMISSION_DENIED = '42501'

type Role = { kind: 'anon' } | { kind: 'authenticated'; userId: string }

async function asRole<T>(role: Role, run: (query: typeof pool.query) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('begin')
    if (role.kind === 'anon') {
      await client.query(`set local role anon`)
      await client.query(`select set_config('request.jwt.claims', '{"role":"anon"}', true)`)
    } else {
      await client.query(`set local role authenticated`)
      await client.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify({ sub: role.userId, role: 'authenticated' }),
      ])
    }
    return await run(client.query.bind(client) as typeof pool.query)
  } finally {
    await client.query('rollback')
    client.release()
  }
}

const reception: Role = { kind: 'authenticated', userId: SEED.receptionUserId }
const helena: Role = { kind: 'authenticated', userId: SEED.helenaUserId }
const anon: Role = { kind: 'anon' }

describe('row level security', () => {
  afterAll(async () => {
    await pool.end()
  })

  it('lets reception see the appointments of every dentist', async () => {
    const dentists = await asRole(reception, async (query) => {
      const { rows } = await query<{ dentist_id: string }>(
        `select distinct dentist_id from public.appointments`,
      )
      return rows.map((row) => row.dentist_id)
    })

    expect(dentists.length).toBeGreaterThanOrEqual(3)
  })

  it('limits a dentist to their own appointments', async () => {
    const dentists = await asRole(helena, async (query) => {
      const { rows } = await query<{ dentist_id: string }>(
        `select distinct dentist_id from public.appointments`,
      )
      return rows.map((row) => row.dentist_id)
    })

    expect(dentists).toEqual([SEED.helenaDentistId])
  })

  it('limits a dentist to patients they treat', async () => {
    const [visible, total] = await Promise.all([
      asRole(helena, async (query) => {
        const { rows } = await query<{ count: string }>(`select count(*) from public.patients`)
        return Number(rows[0]?.count)
      }),
      pool
        .query<{ count: string }>(
          `select count(distinct patient_id) from public.appointments where dentist_id = $1`,
          [SEED.helenaDentistId],
        )
        .then(({ rows }) => Number(rows[0]?.count)),
    ])

    expect(visible).toBe(total)
  })

  it('prevents a dentist from updating another dentist appointment', async () => {
    const updated = await asRole(helena, async (query) => {
      const { rowCount } = await query(
        `update public.appointments set status = 'cancelled' where dentist_id = $1`,
        [SEED.rafaelDentistId],
      )
      return rowCount
    })

    expect(updated).toBe(0)
  })

  it('prevents a dentist from moving an appointment to another dentist', async () => {
    const attempt = asRole(helena, async (query) => {
      await query(
        `update public.appointments set dentist_id = $1
         where id = (select id from public.appointments where status = 'scheduled' limit 1)`,
        [SEED.rafaelDentistId],
      )
    })

    await expect(attempt).rejects.toSatisfy((error) => sqlState(error) === PERMISSION_DENIED)
  })

  it('hides appointments, patients and blocks from anonymous visitors', async () => {
    for (const table of ['appointments', 'patients', 'schedule_blocks']) {
      const attempt = asRole(anon, (query) => query(`select 1 from public.${table} limit 1`))
      await expect(attempt).rejects.toSatisfy((error) => sqlState(error) === PERMISSION_DENIED)
    }
  })

  it('keeps the booking function out of reach of anonymous and staff roles', async () => {
    for (const role of [anon, reception]) {
      const attempt = asRole(role, (query) =>
        query(`select public.book_appointment(null, null, now(), '', '', '', 'private', null)`),
      )
      await expect(attempt).rejects.toSatisfy((error) => sqlState(error) === PERMISSION_DENIED)
    }
  })

  it('exposes only busy periods to anonymous visitors', async () => {
    const columns = await asRole(anon, async (query) => {
      const { fields } = await query(
        `select * from public.get_busy_periods($1, now(), now() + interval '7 days')`,
        [[SEED.helenaDentistId]],
      )
      return fields.map((field) => field.name)
    })

    expect(columns).toEqual(['dentist_id', 'starts_at', 'ends_at'])
  })

  it('lets anonymous visitors read the public catalog', async () => {
    const treatments = await asRole(anon, async (query) => {
      const { rows } = await query<{ count: string }>(`select count(*) from public.treatments`)
      return Number(rows[0]?.count)
    })

    expect(treatments).toBe(7)
  })
})
