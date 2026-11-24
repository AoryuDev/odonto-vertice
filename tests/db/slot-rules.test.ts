import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  book,
  createTestDentist,
  pool,
  removeTestDentist,
  SEED,
  sqlMessage,
  type TestDentist,
} from './fixtures'

describe('appointment rule trigger', () => {
  let dentist: TestDentist

  beforeEach(async () => {
    dentist = await createTestDentist()
  })

  afterEach(async () => {
    await pool.query(`delete from public.schedule_blocks where dentist_id = $1`, [dentist.id])
    await removeTestDentist(dentist)
  })

  afterAll(async () => {
    await pool.end()
  })

  const rejectsWith = (reason: string) => (error: unknown) => sqlMessage(error) === reason

  it('rejects appointments before opening time', async () => {
    await expect(book({ dentistId: dentist.id, startsAt: dentist.at('07:45') })).rejects.toSatisfy(
      rejectsWith('outside_working_hours'),
    )
  })

  it('rejects appointments that would end after closing time', async () => {
    await expect(book({ dentistId: dentist.id, startsAt: dentist.at('17:45') })).rejects.toSatisfy(
      rejectsWith('outside_working_hours'),
    )
  })

  it('rejects appointments that cross the lunch break', async () => {
    await expect(book({ dentistId: dentist.id, startsAt: dentist.at('11:45') })).rejects.toSatisfy(
      rejectsWith('outside_working_hours'),
    )
  })

  it('accepts an appointment that ends exactly when lunch starts', async () => {
    await expect(book({ dentistId: dentist.id, startsAt: dentist.at('11:30') })).resolves.toEqual(
      expect.any(String),
    )
  })

  it('rejects appointments on clinic holidays', async () => {
    const { rows } = await pool.query<{ date: string }>(
      `select to_char(date, 'YYYY-MM-DD') as date from public.holidays
       where date > (now() at time zone 'America/Sao_Paulo')::date order by date limit 1`,
    )
    const holiday = rows[0]?.date
    expect(holiday).toBeDefined()

    await expect(
      book({ dentistId: dentist.id, startsAt: `${holiday}T09:00:00-03:00` }),
    ).rejects.toSatisfy(rejectsWith('clinic_closed'))
  })

  it('rejects appointments that overlap a manual block', async () => {
    await pool.query(
      `insert into public.schedule_blocks (dentist_id, period, reason)
       values ($1, tstzrange($2::timestamptz, $3::timestamptz, '[)'), 'Reunião')`,
      [dentist.id, dentist.at('14:00'), dentist.at('15:00')],
    )

    await expect(book({ dentistId: dentist.id, startsAt: dentist.at('14:45') })).rejects.toSatisfy(
      rejectsWith('slot_blocked'),
    )
  })

  it('rejects appointments in the past', async () => {
    await expect(
      book({ dentistId: dentist.id, startsAt: '2020-03-02T09:00:00-03:00' }),
    ).rejects.toSatisfy(rejectsWith('slot_in_past'))
  })

  it('rejects treatments the dentist does not offer', async () => {
    await expect(
      book({
        dentistId: SEED.rafaelDentistId,
        treatmentId: SEED.cleaningTreatmentId,
        startsAt: dentist.at('09:00'),
      }),
    ).rejects.toSatisfy(rejectsWith('treatment_not_offered'))
  })

  it('derives the end of the period from the treatment duration', async () => {
    const id = await book({
      dentistId: dentist.id,
      treatmentId: SEED.cleaningTreatmentId,
      startsAt: dentist.at('09:00'),
    })

    const { rows } = await pool.query<{ minutes: number }>(
      `select extract(epoch from upper(period) - lower(period))::int / 60 as minutes
       from public.appointments where id = $1`,
      [id],
    )
    expect(rows[0]?.minutes).toBe(45)
  })

  it('rejects a manual period that does not match the treatment duration', async () => {
    const id = await book({ dentistId: dentist.id, startsAt: dentist.at('09:00') })

    const stretched = pool.query(
      `update public.appointments
       set period = tstzrange(lower(period), lower(period) + interval '90 minutes', '[)')
       where id = $1`,
      [id],
    )

    await expect(stretched).rejects.toSatisfy(rejectsWith('duration_mismatch'))
  })

  it('stamps cancellation time and counts reschedules automatically', async () => {
    const id = await book({ dentistId: dentist.id, startsAt: dentist.at('09:00') })
    await pool.query(
      `update public.appointments
       set period = tstzrange($2::timestamptz, $2::timestamptz + interval '30 minutes', '[)')
       where id = $1`,
      [id, dentist.at('10:00')],
    )
    await pool.query(`update public.appointments set status = 'cancelled' where id = $1`, [id])

    const { rows } = await pool.query<{ rescheduled_count: number; cancelled: boolean }>(
      `select rescheduled_count, cancelled_at is not null as cancelled
       from public.appointments where id = $1`,
      [id],
    )
    expect(rows[0]).toEqual({ rescheduled_count: 1, cancelled: true })
  })
})
