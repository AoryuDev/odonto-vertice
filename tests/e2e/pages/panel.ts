import { expect, type Page } from '@playwright/test'

export const DEMO_PASSWORD = 'vertice-demo-2026'

export async function signIn(page: Page, email: string) {
  await page.goto('/painel')
  await expect(page).toHaveURL(/\/painel\/login$/)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/painel$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

export function dentistColumns(page: Page) {
  return page.getByRole('main').locator('.sticky.top-0 p.truncate')
}
