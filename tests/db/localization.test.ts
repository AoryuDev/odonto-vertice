import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  asRole,
  book,
  createTestDentist,
  pool,
  removeTestDentist,
  SEED,
  sqlState,
  type Role,
  type TestDentist,
} from './fixtures'

const PERMISSION_DENIED = '42501'
const anon: Role = { kind: 'anon' }
const helena: Role = { kind: 'authenticated', userId: SEED.helenaUserId }

afterAll(async () => {
  await pool.end()
})

describe('localized catalog', () => {
  it('has every bookable treatment and active dentist in Portuguese and English', async () => {
    const { rows } = await pool.query<{ kind: string; slug: string; locales: string[] }>(
      `select 'treatment' as kind, t.slug, array_agg(tt.locale::text order by tt.locale::text) as locales
       from public.treatments t
       left join public.treatment_translations tt on tt.treatment_id = t.id
       where t.is_bookable and t.slug not like 'test-%'
       group by t.slug
       union all
       select 'dentist', d.slug, array_agg(dt.locale::text order by dt.locale::text)
       from public.dentists d
       left join public.dentist_translations dt on dt.dentist_id = d.id
       where d.is_active and d.slug not like 'test-%'
       group by d.slug`,
    )

    expect(rows.length).toBe(10)
    for (const row of rows) expect(row.locales, `${row.kind} ${row.slug}`).toEqual(['en', 'pt'])
  })

  it('lets anonymous visitors read translations but never change them', async () => {
    const names = await asRole(anon, async (query) => {
      const { rows } = await query<{ name: string }>(
        `select name from public.treatment_translations where treatment_id = $1 order by locale`,
        [SEED.cleaningTreatmentId],
      )
      return rows.map((row) => row.name)
    })
    expect(names).toEqual(['Limpeza', 'Cleaning'])

    const attempt = asRole(anon, (query) =>
      query(`update public.treatment_translations set name = 'Hacked' where treatment_id = $1`, [
        SEED.cleaningTreatmentId,
      ]),
    )
    await expect(attempt).rejects.toSatisfy((error) => sqlState(error) === PERMISSION_DENIED)
  })
})

describe('appointment language', () => {
  let dentist: TestDentist

  beforeEach(async () => {
    dentist = await createTestDentist(230)
  })

  afterEach(async () => {
    await removeTestDentist(dentist)
  })

  const localeOf = async (id: string) => {
    const { rows } = await pool.query<{ locale: string }>(
      `select locale from public.appointments where id = $1`,
      [id],
    )
    return rows[0]?.locale
  }

  it('stores the language the patient booked in, Portuguese by default', async () => {
    const english = await book({
      dentistId: dentist.id,
      startsAt: dentist.at('09:00'),
      locale: 'en',
    })
    const { rows } = await pool.query<{ id: string }>(
      `select public.book_appointment(
         gen_random_uuid(), $1, $2, $3, 'Paciente Padrão', $4, '+5562999990000', 'private', $5
       ) as id`,
      [
        dentist.id,
        SEED.evaluationTreatmentId,
        dentist.at('10:00'),
        `default-${dentist.id}@example.test`,
        Buffer.alloc(32, 7),
      ],
    )

    expect(await localeOf(english)).toBe('en')
    expect(await localeOf(rows[0]!.id)).toBe('pt')
  })

  it('hands reminders the treatment and dentist names in the appointment language', async () => {
    await book({ dentistId: dentist.id, startsAt: dentist.at('09:00'), locale: 'en' })
    await book({
      dentistId: dentist.id,
      startsAt: dentist.at('10:00'),
      treatmentId: SEED.cleaningTreatmentId,
    })

    const { rows } = await pool.query<{
      locale: string
      treatment_name: string
      dentist_name: string
    }>(
      `select locale, treatment_name, dentist_name from public.claim_reminders($1, $2, 'email')
       where appointment_id in (select id from public.appointments where dentist_id = $3)
       order by starts_at`,
      [dentist.at('00:00'), `${dentist.date}T23:59:00-03:00`, dentist.id],
    )

    expect(rows).toEqual([
      { locale: 'en', treatment_name: 'Dental exam', dentist_name: 'Dr. Test' },
      { locale: 'pt', treatment_name: 'Limpeza', dentist_name: 'Dra. Teste' },
    ])
  })
})

describe('staff language preference', () => {
  it('lets staff change only their own language', async () => {
    const changed = await asRole(helena, async (query) => {
      const own = await query(
        `update public.staff_profiles set locale = 'en' where user_id = $1 returning locale`,
        [SEED.helenaUserId],
      )
      const others = await query(
        `update public.staff_profiles set locale = 'en' where user_id = $1 returning locale`,
        [SEED.receptionUserId],
      )
      return { own: own.rowCount, others: others.rowCount }
    })

    expect(changed).toEqual({ own: 1, others: 0 })
  })

  it('keeps every other profile column read-only', async () => {
    const attempt = asRole(helena, (query) =>
      query(`update public.staff_profiles set role = 'reception' where user_id = $1`, [
        SEED.helenaUserId,
      ]),
    )
    await expect(attempt).rejects.toSatisfy((error) => sqlState(error) === PERMISSION_DENIED)
  })
})
