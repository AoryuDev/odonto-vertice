import { expect, type Page } from '@playwright/test'
import { localized, MESSAGES, type Locale } from '../support/i18n'

export const DEMO_PASSWORD = 'vertice-demo-2026'

export async function signIn(page: Page, email: string, locale: Locale = 'pt') {
  const text = MESSAGES[locale].panel.login
  await page.goto(localized(locale, '/painel'))
  await expect(page).toHaveURL(/\/painel\/login$/)
  await page.getByLabel(text.email).fill(email)
  await page.getByLabel(text.password).fill(DEMO_PASSWORD)
  await page.getByRole('button', { name: text.submit, exact: true }).click()
  await expect(page).toHaveURL(/\/painel$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

export function dentistColumns(page: Page) {
  return page.getByRole('main').locator('.sticky.top-0 p.truncate')
}
