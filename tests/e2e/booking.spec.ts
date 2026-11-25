import { expect, test, type Page } from '@playwright/test'
import { BookingFlow, uniquePatient } from './pages/booking-flow'
import {
  CATALOG,
  expectFullyTranslated,
  LOCALES,
  localized,
  MESSAGES,
  plain,
  type Locale,
} from './support/i18n'

const BOOKING_DENTIST = { pt: 'camila', en: 'helena' } as const satisfies Record<
  Locale,
  keyof (typeof CATALOG)['pt']
>

for (const locale of LOCALES) {
  const text = MESSAGES[locale]
  const catalog = CATALOG[locale]
  const checkTranslation = async (page: Page) => {
    if (locale === 'en') await expectFullyTranslated(page)
  }

  test.describe(`online booking (${locale})`, () => {
    test('books, reschedules and cancels an appointment without logging in', async ({ page }) => {
      const flow = new BookingFlow(page, locale)
      const dentist = catalog[BOOKING_DENTIST[locale]]
      const patient = { ...uniquePatient(`fluxo-${locale}`), insurance: 'Plano Teste' }

      await page.goto(localized(locale))
      await checkTranslation(page)
      await page.getByRole('link', { name: text.home.hero.bookOnline }).click()
      await expect(
        page.getByRole('heading', { name: text.booking.treatmentStep.title }),
      ).toBeVisible()
      await checkTranslation(page)

      await flow.chooseTreatment(catalog.evaluation)
      await checkTranslation(page)
      await flow.chooseDentist(dentist)
      await checkTranslation(page)
      await flow.chooseFirstSlot()
      await checkTranslation(page)
      await flow.confirm()
      await expect(page.getByText(text.validation.nameRequired)).toBeVisible()
      await checkTranslation(page)
      await flow.fillPatient(patient)
      await flow.confirm()

      await expect(page).toHaveURL(new RegExp(`/${locale}/agendamento/[\\w-]{43}\\?novo=1$`))
      await expect(
        page.getByRole('heading', { name: text.manage.banners.booked.title }),
      ).toBeVisible()
      await expect(page.getByRole('main').getByText(patient.email)).toBeVisible()
      await expect(page.getByRole('definition').filter({ hasText: dentist })).toBeVisible()
      await expect(
        page.getByRole('main').getByText(text.manage.status.scheduled, { exact: true }),
      ).toBeVisible()
      await checkTranslation(page)

      const manageUrl = page.url().split('?')[0] ?? ''
      const manageToken = manageUrl.split('/').at(-1) ?? ''
      const calendar = (await (await page.request.get(`${manageUrl}/calendario`)).text()).replace(
        /\r\n /g,
        '',
      )
      expect(calendar).toMatch(new RegExp(`\\nURL:\\S+/${locale}/agendamento/${manageToken}\\r`))
      expect(calendar).toContain(`SUMMARY:${catalog.evaluation} · Odonto Vértice`)

      await page.getByRole('link', { name: text.manage.reschedule, exact: true }).click()
      await expect(page.getByRole('heading', { name: text.reschedule.title })).toBeVisible()
      await page
        .locator('section[aria-labelledby="horarios-titulo"]:visible')
        .getByRole('link')
        .nth(1)
        .click()
      await checkTranslation(page)
      await page.getByRole('button', { name: text.reschedule.confirm }).click()
      await expect(
        page.getByRole('heading', { name: text.manage.banners.rescheduled.title }),
      ).toBeVisible()

      await page.locator('summary', { hasText: text.manage.cancel }).click()
      await page
        .getByLabel(new RegExp(text.manage.reasonLabel.replace('?', '\\?')))
        .selectOption('schedule_conflict')
      await checkTranslation(page)
      await page.getByRole('button', { name: text.manage.confirmCancel }).click()
      await expect(
        page.getByRole('heading', { name: text.manage.banners.cancelled.title }),
      ).toBeVisible()
      await checkTranslation(page)

      await page.goto(manageUrl)
      await expect(
        page.getByRole('main').getByText(text.manage.status.cancelled, { exact: true }),
      ).toBeVisible()
      await expect(
        page.getByRole('link', { name: text.manage.reschedule, exact: true }),
      ).toHaveCount(0)
    })

    test('validates patient details on the server-shared schema before booking', async ({
      page,
    }) => {
      const flow = new BookingFlow(page, locale)
      const form = text.booking.form
      await flow.open('/limpeza/helena-prado')
      await flow.chooseSlot('last')

      await flow.confirm()

      await expect(page.getByText(text.validation.nameRequired)).toBeVisible()
      await expect(page.getByText(text.validation.emailRequired)).toBeVisible()
      await expect(page.getByText(text.validation.consentRequired)).toBeVisible()

      await page.getByLabel(form.fullName).fill('Ana')
      await page.getByLabel(form.phone).fill('1234')
      await page.getByLabel(form.email, { exact: true }).click()
      await expect(page.getByText(text.validation.nameIncomplete)).toBeVisible()
      await expect(page.getByText(text.validation.phoneInvalid)).toBeVisible()
      await expect(page.getByLabel(form.fullName)).toHaveAttribute('aria-invalid', 'true')
    })

    test('shows a non-indexable not-found page for unknown or malformed booking paths', async ({
      page,
    }) => {
      for (const path of [
        '/agendar/nao-existe',
        '/agendar/limpeza/camila-arantes',
        "/agendar/limpeza/'drop",
        '/agendamento/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      ]) {
        await page.goto(localized(locale, path))

        await expect(page.getByRole('heading', { name: plain(text.notFound.title) })).toBeVisible()
        const robots = await page
          .locator('meta[name="robots"]')
          .evaluateAll((tags) => tags.map((tag) => tag.getAttribute('content') ?? ''))
        expect(robots.length).toBeGreaterThan(0)
        expect(robots.every((content) => content.includes('noindex'))).toBe(true)
      }
    })

    test('falls back to the slot list when the chosen time is malformed', async ({ page }) => {
      await page.goto(localized(locale, '/agendar/limpeza/helena-prado/dados?horario=amanha'))

      await expect(page.getByRole('link', { name: text.booking.details.seeTimes })).toBeVisible()
    })
  })
}
