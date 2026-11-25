import { expect, test } from '@playwright/test'
import { dentistColumns, signIn } from './pages/panel'
import { CATALOG, expectFullyTranslated, localized, MESSAGES, plain } from './support/i18n'

const text = MESSAGES.pt.panel
const catalog = CATALOG.pt

test.describe('clinic panel', () => {
  test('redirects anonymous visitors to the login page', async ({ page }) => {
    await page.goto(localized('pt', '/painel/bloqueios'))

    await expect(page).toHaveURL(/\/pt\/painel\/login$/)
  })

  test('rejects wrong credentials without revealing which field was wrong', async ({ page }) => {
    await page.goto(localized('pt', '/painel/login'))
    await page.getByLabel(text.login.email).fill('recepcao@odontovertice.example')
    await page.getByLabel(text.login.password).fill('senha-errada-123')
    await page.getByRole('button', { name: text.login.submit, exact: true }).click()

    await expect(page.getByText(text.login.errors.wrong)).toBeVisible()
  })

  test('reception sees every dentist agenda', async ({ page }) => {
    await signIn(page, 'recepcao@odontovertice.example')

    await expect(dentistColumns(page)).toHaveText([catalog.helena, catalog.rafael, catalog.camila])
    await expect(page.getByRole('navigation', { name: text.agenda.filterLabel })).toBeVisible()
  })

  test('a dentist sees only their own agenda, even when opening another dentist appointment by URL', async ({
    browser,
  }) => {
    const receptionContext = await browser.newContext()
    const reception = await receptionContext.newPage()
    await signIn(reception, 'recepcao@odontovertice.example')
    await reception.getByRole('link', { name: text.agenda.views.semana }).click()
    const helenaFilter = reception
      .getByRole('navigation', { name: text.agenda.filterLabel })
      .getByRole('link', { name: catalog.helena })
    await helenaFilter.click()
    const helenaAppointment = await reception
      .locator('a[href*="/painel/consultas/"]')
      .first()
      .getAttribute('href')
    expect(helenaAppointment).toBeTruthy()

    const dentistContext = await browser.newContext()
    const dentist = await dentistContext.newPage()
    await signIn(dentist, 'rafael@odontovertice.example')

    await expect(dentistColumns(dentist)).toHaveText([catalog.rafael])
    await expect(dentist.getByRole('navigation', { name: text.agenda.filterLabel })).toHaveCount(0)

    await dentist.goto(helenaAppointment ?? '/')
    await expect(
      dentist.getByRole('heading', { name: plain(MESSAGES.pt.notFound.title) }),
    ).toBeVisible()

    await receptionContext.close()
    await dentistContext.close()
  })

  test('creates and removes a schedule block', async ({ page }) => {
    const form = text.blocks.form
    await signIn(page, 'recepcao@odontovertice.example')
    await page.getByRole('link', { name: text.layout.nav.blocks }).click()
    await expect(page).toHaveURL(/\/painel\/bloqueios$/)

    const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 41)
    await page.getByLabel(form.dentist, { exact: true }).selectOption({ label: catalog.camila })
    await page.getByLabel(form.date, { exact: true }).fill(date.toISOString().slice(0, 10))
    await page.getByLabel(form.from, { exact: true }).fill('07:00')
    await page.getByLabel(form.to, { exact: true }).fill('07:45')
    const reason = `E2E ${Date.now()}`
    await page.getByLabel(form.reason, { exact: true }).fill(reason)
    await page.getByRole('button', { name: form.submit }).click()
    await expect(page.getByText(form.saved)).toBeVisible()

    await page.reload()
    await page
      .getByRole('button', {
        name: `${text.blocks.remove} ${text.blocks.removeLabel.replace('{reason}', reason)}`,
      })
      .click()
    await expect(page.getByText(text.blocks.removed)).toBeVisible()
  })

  test('follows the language each staff member picks, across sign-ins', async ({ page }) => {
    test.slow()
    const en = MESSAGES.en.panel
    await signIn(page, 'camila@odontovertice.example')
    await page.goto(localized('pt', '/painel'))

    await page
      .getByRole('navigation', { name: MESSAGES.pt.localeSwitcher.label })
      .getByRole('button', { name: 'English' })
      .click()
    await expect(page).toHaveURL(/\/en\/painel$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('navigation', { name: en.layout.navLabel })).toBeVisible()
    await expectFullyTranslated(page)

    await page.getByRole('link', { name: en.layout.nav.blocks }).click()
    await expect(page.getByRole('heading', { level: 1, name: en.blocks.title })).toBeVisible()
    await expectFullyTranslated(page)

    await page.getByRole('button', { name: en.staff.signOut }).click()
    await expect(page).toHaveURL(/\/en\/painel\/login$/)
    await signIn(page, 'camila@odontovertice.example', 'pt')
    await expect(page).toHaveURL(/\/en\/painel$/)

    await page
      .getByRole('navigation', { name: MESSAGES.en.localeSwitcher.label })
      .getByRole('button', { name: 'Português' })
      .click()
    await expect(page).toHaveURL(/\/pt\/painel$/)
  })
})
