import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { book, createTestDentist, pool, removeTestDentist, type TestDentist } from './fixtures'

describe('claim_reminders', () => {
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

  const claim = async () => {
    const { rows } = await pool.query<{ delivery_id: string; appointment_id: string }>(
      `select * from public.claim_reminders($1, $2, 'email')
       where appointment_id in (select id from public.appointments where dentist_id = $3)`,
      [dentist.at('00:00'), `${dentist.date}T23:59:00-03:00`, dentist.id],
    )
    return rows
  }

  it('claims each upcoming appointment exactly once', async () => {
    await book({ dentistId: dentist.id, startsAt: dentist.at('09:00') })
    await book({ dentistId: dentist.id, startsAt: dentist.at('10:00') })

    expect(await claim()).toHaveLength(2)
    expect(await claim()).toHaveLength(0)
  })

  it('never hands the same reminder to two concurrent runs', async () => {
    await book({ dentistId: dentist.id, startsAt: dentist.at('09:00') })

    const runs = await Promise.all([claim(), claim(), claim()])

    expect(runs.flat()).toHaveLength(1)
  })

  it('retries failed deliveries up to three attempts', async () => {
    await book({ dentistId: dentist.id, startsAt: dentist.at('09:00') })
    const fail = (id: string) =>
      pool.query(`update public.notification_deliveries set status = 'failed' where id = $1`, [id])

    const [first] = await claim()
    await fail(first!.delivery_id)
    const [second] = await claim()
    await fail(second!.delivery_id)
    const [third] = await claim()
    await fail(third!.delivery_id)

    expect(second?.delivery_id).toBe(first?.delivery_id)
    expect(third?.delivery_id).toBe(first?.delivery_id)
    expect(await claim()).toHaveLength(0)
  })

  it('skips cancelled appointments', async () => {
    const id = await book({ dentistId: dentist.id, startsAt: dentist.at('09:00') })
    await pool.query(`update public.appointments set status = 'cancelled' where id = $1`, [id])

    expect(await claim()).toHaveLength(0)
  })

  it('claims again after the appointment is moved to a new time', async () => {
    const id = await book({ dentistId: dentist.id, startsAt: dentist.at('09:00') })
    await claim()
    await pool.query(
      `update public.appointments
       set period = tstzrange($2::timestamptz, $2::timestamptz + interval '30 minutes', '[)')
       where id = $1`,
      [id, dentist.at('15:00')],
    )

    expect(await claim()).toHaveLength(1)
  })
})
