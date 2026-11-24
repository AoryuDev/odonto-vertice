import { randomBytes } from 'node:crypto'
import { afterAll, describe, expect, it } from 'vitest'
import { pool } from './fixtures'

async function attempt(fingerprint: Buffer, limit: number): Promise<boolean> {
  const { rows } = await pool.query<{ allowed: boolean }>(
    `select public.register_booking_attempt($1, $2, 15) as allowed`,
    [fingerprint, limit],
  )
  return rows[0]?.allowed ?? false
}

describe('register_booking_attempt', () => {
  afterAll(async () => {
    await pool.end()
  })

  it('allows attempts up to the limit and refuses the next one', async () => {
    const fingerprint = randomBytes(32)

    const results = []
    for (let index = 0; index < 4; index += 1) results.push(await attempt(fingerprint, 3))

    expect(results).toEqual([true, true, true, false])
  })

  it('counts each fingerprint separately', async () => {
    const first = randomBytes(32)
    await attempt(first, 1)

    expect(await attempt(first, 1)).toBe(false)
    expect(await attempt(randomBytes(32), 1)).toBe(true)
  })

  it('serializes concurrent attempts from the same fingerprint', async () => {
    const fingerprint = randomBytes(32)

    const results = await Promise.all(Array.from({ length: 10 }, () => attempt(fingerprint, 4)))

    expect(results.filter(Boolean)).toHaveLength(4)
  })
})
