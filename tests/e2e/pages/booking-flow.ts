import { expect, type Locator, type Page } from '@playwright/test'
import { localized, MESSAGES, type Locale } from '../support/i18n'

export type Patient = {
  readonly fullName: string
  readonly email: string
  readonly phone: string
  readonly insurance?: string
}

export function uniquePatient(label: string): Patient {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  return {
    fullName: `Paciente ${label} Teste`,
    email: `e2e-${label}-${suffix}@example.com`,
    phone: '(62) 99876-5432',
  }
}

export class BookingFlow {
  readonly main: Locator
  readonly slots: Locator
  readonly confirmButton: Locator
  readonly text: (typeof MESSAGES)[Locale]['booking']

  constructor(
    readonly page: Page,
    readonly locale: Locale = 'pt',
  ) {
    this.text = MESSAGES[locale].booking
    this.main = page.getByRole('main')
    this.slots = page.locator('section[aria-labelledby="horarios-titulo"]').getByRole('link')
    this.confirmButton = page.getByRole('button', { name: this.text.form.submit })
  }

  async open(path = '') {
    await this.page.goto(localized(this.locale, `/agendar${path}`))
  }

  async chooseTreatment(name: string) {
    await this.main.getByRole('link', { name: new RegExp(`^${name} \\d`) }).click()
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      new RegExp(`${this.text.dentistStep.titleMany}|${this.text.dentistStep.titleOne}`),
    )
  }

  async chooseDentist(name: string) {
    await this.main.getByRole('link', { name: new RegExp(name) }).click()
    await expect(this.page.getByRole('heading', { name: this.text.slotStep.title })).toBeVisible()
  }

  async chooseFirstSlot(): Promise<string> {
    return this.chooseSlot('first')
  }

  async chooseSlot(position: 'first' | 'last'): Promise<string> {
    const slot = position === 'first' ? this.slots.first() : this.slots.last()
    const href = await slot.getAttribute('href')
    await slot.click()
    await expect(this.page.getByRole('heading', { name: this.text.details.title })).toBeVisible()
    return href ?? ''
  }

  async fillPatient(patient: Patient) {
    const form = this.text.form
    await this.page.getByLabel(form.fullName).fill(patient.fullName)
    await this.page.getByLabel(form.email, { exact: true }).fill(patient.email)
    await this.page.getByLabel(form.phone).fill(patient.phone)
    if (patient.insurance) {
      await this.page.getByText(form.insurance, { exact: true }).click()
      await this.page.getByLabel(form.insuranceProvider).fill(patient.insurance)
    }
    await this.page.getByRole('checkbox', { name: form.consent }).check()
  }

  async confirm() {
    await this.confirmButton.click()
  }
}
