import { expect, type Locator, type Page } from '@playwright/test'

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

  constructor(readonly page: Page) {
    this.main = page.getByRole('main')
    this.slots = page.locator('section[aria-labelledby="horarios-titulo"]').getByRole('link')
    this.confirmButton = page.getByRole('button', { name: 'Confirmar agendamento' })
  }

  async open(path = '') {
    await this.page.goto(`/agendar${path}`)
  }

  async chooseTreatment(name: string) {
    await this.main.getByRole('link', { name: new RegExp(`^${name} \\d`) }).click()
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      /Com quem|Quem vai atender/,
    )
  }

  async chooseDentist(name: string) {
    await this.main.getByRole('link', { name: new RegExp(name) }).click()
    await expect(
      this.page.getByRole('heading', { name: 'Escolha o dia e o horário' }),
    ).toBeVisible()
  }

  async chooseFirstSlot(): Promise<string> {
    const slot = this.slots.first()
    const href = await slot.getAttribute('href')
    await slot.click()
    await expect(this.page.getByRole('heading', { name: 'Seus dados' })).toBeVisible()
    return href ?? ''
  }

  async fillPatient(patient: Patient) {
    await this.page.getByLabel('Nome completo').fill(patient.fullName)
    await this.page.getByLabel('E-mail').fill(patient.email)
    await this.page.getByLabel('Celular com DDD').fill(patient.phone)
    if (patient.insurance) {
      await this.page.getByText('Convênio', { exact: true }).click()
      await this.page.getByLabel('Nome do convênio').fill(patient.insurance)
    }
    await this.page.getByRole('checkbox', { name: /Autorizo/ }).check()
  }

  async confirm() {
    await this.confirmButton.click()
  }
}
