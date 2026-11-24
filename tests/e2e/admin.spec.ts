import { expect, test } from '@playwright/test'
import { dentistColumns, signIn } from './pages/panel'

test.describe('clinic panel', () => {
  test('redirects anonymous visitors to the login page', async ({ page }) => {
    await page.goto('/painel/bloqueios')

    await expect(page).toHaveURL(/\/painel\/login$/)
  })

  test('rejects wrong credentials without revealing which field was wrong', async ({ page }) => {
    await page.goto('/painel/login')
    await page.getByLabel('E-mail').fill('recepcao@odontovertice.example')
    await page.getByLabel('Senha').fill('senha-errada-123')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible()
  })

  test('reception sees every dentist agenda', async ({ page }) => {
    await signIn(page, 'recepcao@odontovertice.example')

    await expect(dentistColumns(page)).toHaveText([
      'Dra. Helena Prado',
      'Dr. Rafael Tavares',
      'Dra. Camila Arantes',
    ])
    await expect(page.getByRole('navigation', { name: 'Filtrar por dentista' })).toBeVisible()
  })

  test('a dentist sees only their own agenda, even when opening another dentist appointment by URL', async ({
    browser,
  }) => {
    const receptionContext = await browser.newContext()
    const reception = await receptionContext.newPage()
    await signIn(reception, 'recepcao@odontovertice.example')
    await reception.getByRole('link', { name: 'semana' }).click()
    const helenaFilter = reception
      .getByRole('navigation', { name: 'Filtrar por dentista' })
      .getByRole('link', { name: 'Dra. Helena Prado' })
    await helenaFilter.click()
    const helenaAppointment = await reception
      .locator('a[href*="/painel/consultas/"]')
      .first()
      .getAttribute('href')
    expect(helenaAppointment).toBeTruthy()

    const dentistContext = await browser.newContext()
    const dentist = await dentistContext.newPage()
    await signIn(dentist, 'rafael@odontovertice.example')

    await expect(dentistColumns(dentist)).toHaveText(['Dr. Rafael Tavares'])
    await expect(dentist.getByRole('navigation', { name: 'Filtrar por dentista' })).toHaveCount(0)

    await dentist.goto(helenaAppointment ?? '/')
    await expect(dentist.getByRole('heading', { name: /Essa página não existe/ })).toBeVisible()

    await receptionContext.close()
    await dentistContext.close()
  })

  test('creates and removes a schedule block', async ({ page }) => {
    await signIn(page, 'recepcao@odontovertice.example')
    await page.getByRole('link', { name: 'Bloqueios' }).click()
    await expect(page).toHaveURL(/\/painel\/bloqueios$/)

    const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 41)
    await page
      .getByLabel('Dentista', { exact: true })
      .selectOption({ label: 'Dra. Camila Arantes' })
    await page.getByLabel('Data', { exact: true }).fill(date.toISOString().slice(0, 10))
    await page.getByLabel('Das', { exact: true }).fill('07:00')
    await page.getByLabel('Até', { exact: true }).fill('07:45')
    const reason = `E2E ${Date.now()}`
    await page.getByLabel('Motivo', { exact: true }).fill(reason)
    await page.getByRole('button', { name: 'Bloquear horário' }).click()
    await expect(page.getByText('Bloqueio salvo.')).toBeVisible()

    await page.reload()
    await page.getByRole('button', { name: `Remover bloqueio ${reason}` }).click()
    await expect(page.getByText('Bloqueio removido.')).toBeVisible()
  })
})
