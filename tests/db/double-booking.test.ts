import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  book,
  createTestDentist,
  pool,
  removeTestDentist,
  sqlMessage,
  sqlState,
  type TestDentist,
} from './fixtures'

const EXCLUSION_VIOLATION = '23P01'

describe('appointments_no_overlap exclusion constraint', () => {
  let dentist: TestDentist
  let otherDentist: TestDentist

  beforeEach(async () => {
    dentist = await createTestDentist()
    otherDentist = await createTestDentist()
  })

  afterEach(async () => {
    await removeTestDentist(dentist)
    await removeTestDentist(otherDentist)
  })

  afterAll(async () => {
    await pool.end()
  })

  it('rejects a second appointment that overlaps the first for the same dentist', async () => {
    await book({ dentistId: dentist.id, startsAt: dentist.at('09:00') })

    const overlapping = book({ dentistId: dentist.id, startsAt: dentist.at('09:15') })

    await expect(overlapping).rejects.toSatisfy(
      (error) =>
        sqlState(error) === EXCLUSION_VIOLATION &&
        sqlMessage(error).includes('appointments_no_overlap'),
    )
  })

  it('accepts back-to-back appointments because periods are half-open', async () => {
    await book({ dentistId: dentist.id, startsAt: dentist.at('09:00') })

    await expect(book({ dentistId: dentist.id, startsAt: dentist.at('09:30') })).resolves.toEqual(
      expect.any(String),
    )
  })

  it('accepts the same time for different dentists', async () => {
    await book({ dentistId: dentist.id, startsAt: dentist.at('10:00') })

    await expect(
      book({ dentistId: otherDentist.id, startsAt: otherDentist.at('10:00') }),
    ).resolves.toEqual(expect.any(String))
  })

  it('frees the slot once the existing appointment is cancelled', async () => {
    const firstId = await book({ dentistId: dentist.id, startsAt: dentist.at('11:00') })
    await pool.query(`update public.appointments set status = 'cancelled' where id = $1`, [firstId])

    await expect(book({ dentistId: dentist.id, startsAt: dentist.at('11:00') })).resolves.toEqual(
      expect.any(String),
    )
  })

  it('blocks a rescheduled appointment from landing on an occupied slot', async () => {
    await book({ dentistId: dentist.id, startsAt: dentist.at('14:00') })
    const movingId = await book({ dentistId: dentist.id, startsAt: dentist.at('15:00') })

    const reschedule = pool.query(
      `update public.appointments
       set period = tstzrange($2::timestamptz, $2::timestamptz + interval '30 minutes', '[)')
       where id = $1`,
      [movingId, dentist.at('14:15')],
    )

    await expect(reschedule).rejects.toSatisfy((error) => sqlState(error) === EXCLUSION_VIOLATION)
  })

  it('lets exactly one of many simultaneous bookings for the same slot succeed', async () => {
    const attempts = 12

    const results = await Promise.allSettled(
      Array.from({ length: attempts }, () =>
        book({ dentistId: dentist.id, startsAt: dentist.at('16:00') }),
      ),
    )

    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    const rejected = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    )
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(attempts - 1)
    expect(rejected.every((result) => sqlState(result.reason) === EXCLUSION_VIOLATION)).toBe(true)

    const { rows } = await pool.query<{ count: string }>(
      `select count(*) from public.appointments where dentist_id = $1 and status = 'scheduled'`,
      [dentist.id],
    )
    expect(rows[0]?.count).toBe('1')
  })

  it('makes a concurrent transaction wait for the first one and then fail', async () => {
    const first = await pool.connect()
    const second = await pool.connect()
    try {
      await first.query('begin')
      await second.query('begin')
      await book({ dentistId: dentist.id, startsAt: dentist.at('17:00') }, first)

      const secondAttempt = book({ dentistId: dentist.id, startsAt: dentist.at('17:00') }, second)
      const outcome = secondAttempt.then(
        () => 'committed' as const,
        (error: unknown) => sqlState(error),
      )

      await first.query('commit')

      await expect(outcome).resolves.toBe(EXCLUSION_VIOLATION)
      await second.query('rollback')
    } finally {
      first.release()
      second.release()
    }
  })
})
