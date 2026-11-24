import { expect, test } from '@playwright/test'
import { BookingFlow, uniquePatient } from './pages/booking-flow'

test.describe('online booking', () => {
  test('books, reschedules and cancels an appointment without logging in', async ({ page }) => {
    const flow = new BookingFlow(page)
    const patient = { ...uniquePatient('fluxo'), insurance: 'Plano Teste' }

    await page.goto('/')
    await page.getByRole('link', { name: 'Agendar pelo site' }).click()
    await expect(
      page.getByRole('heading', { name: 'Qual consulta você quer marcar?' }),
    ).toBeVisible()

    await flow.chooseTreatment('Avaliação')
    await flow.chooseDentist('Dra. Camila Arantes')
    await flow.chooseFirstSlot()
    await flow.fillPatient(patient)
    await flow.confirm()

    await expect(page).toHaveURL(/\/agendamento\/[\w-]{43}\?novo=1$/)
    await expect(page.getByRole('heading', { name: 'Consulta confirmada' })).toBeVisible()
    await expect(page.getByRole('main').getByText(patient.email)).toBeVisible()
    await expect(
      page.getByRole('definition').filter({ hasText: 'Dra. Camila Arantes' }),
    ).toBeVisible()
    await expect(page.getByRole('main').getByText('Confirmada', { exact: true })).toBeVisible()

    const manageUrl = page.url().split('?')[0] ?? ''
    await page.getByRole('link', { name: 'Remarcar' }).click()
    await page
      .locator('section[aria-labelledby="horarios-titulo"]')
      .getByRole('link')
      .nth(1)
      .click()
    await page.getByRole('button', { name: 'Confirmar novo horário' }).click()
    await expect(page.getByRole('heading', { name: 'Consulta remarcada' })).toBeVisible()

    await page.locator('summary', { hasText: 'Cancelar consulta' }).click()
    await page.getByLabel(/Quer contar o motivo/).selectOption('Conflito de horário')
    await page.getByRole('button', { name: 'Sim, cancelar consulta' }).click()
    await expect(page.getByRole('heading', { name: 'Consulta cancelada' })).toBeVisible()

    await page.goto(manageUrl)
    await expect(page.getByRole('main').getByText('Cancelada', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Remarcar' })).toHaveCount(0)
  })

  test('validates patient details on the server-shared schema before booking', async ({ page }) => {
    const flow = new BookingFlow(page)
    await flow.open('/limpeza/helena-prado')
    await flow.chooseFirstSlot()

    await flow.confirm()

    await expect(page.getByText('Informe seu nome completo.')).toBeVisible()
    await expect(page.getByText('Informe seu e-mail.')).toBeVisible()
    await expect(
      page.getByText('Precisamos da sua autorização para registrar o agendamento.'),
    ).toBeVisible()

    await page.getByLabel('Nome completo').fill('Ana')
    await page.getByLabel('Celular com DDD').fill('1234')
    await page.getByLabel('E-mail').click()
    await expect(page.getByText('Informe nome e sobrenome.')).toBeVisible()
    await expect(page.getByText('Telefone inválido. Use DDD + número.')).toBeVisible()
    await expect(page.getByLabel('Nome completo')).toHaveAttribute('aria-invalid', 'true')
  })

  test('shows a non-indexable not-found page for unknown or malformed booking paths', async ({
    page,
  }) => {
    for (const path of [
      '/agendar/nao-existe',
      '/agendar/limpeza/camila-arantes',
      "/agendar/limpeza/'drop",
    ]) {
      await page.goto(path)

      await expect(page.getByRole('heading', { name: /Essa página não existe/ })).toBeVisible()
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    }
  })

  test('falls back to the slot list when the chosen time is malformed', async ({ page }) => {
    await page.goto('/agendar/limpeza/helena-prado/dados?horario=amanha')

    await expect(page.getByRole('link', { name: 'Ver horários livres' })).toBeVisible()
  })

  test('shows a not-found page for an invalid manage link', async ({ page }) => {
    await page.goto('/agendamento/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')

    await expect(page.getByRole('heading', { name: /Essa página não existe/ })).toBeVisible()
  })
})
