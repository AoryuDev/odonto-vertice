import { expect, test } from '@playwright/test'
import { BookingFlow, uniquePatient } from './pages/booking-flow'
import { MESSAGES } from './support/i18n'

const text = MESSAGES.pt

test.describe('double booking protection', () => {
  test('two patients confirming the same slot at the same time get exactly one appointment', async ({
    browser,
  }) => {
    const first = await browser.newContext()
    const second = await browser.newContext()
    const alice = new BookingFlow(await first.newPage())
    const bruno = new BookingFlow(await second.newPage())

    await alice.open('/manutencao-de-aparelho/rafael-tavares')
    const slotHref = await alice.chooseFirstSlot()
    await bruno.page.goto(slotHref)
    await expect(
      bruno.page.getByRole('heading', { name: text.booking.details.title }),
    ).toBeVisible()

    await alice.fillPatient(uniquePatient('alice'))
    await bruno.fillPatient(uniquePatient('bruno'))

    await Promise.all([alice.confirm(), bruno.confirm()])

    const outcome = async (flow: BookingFlow) => {
      const confirmed = flow.page.getByRole('heading', {
        name: text.manage.banners.booked.title,
      })
      const conflict = flow.page.getByText(text.booking.errors.slot_unavailable)
      await expect(confirmed.or(conflict)).toBeVisible()
      return (await confirmed.isVisible()) ? 'confirmed' : 'conflict'
    }

    const [aliceResult, brunoResult] = await Promise.all([outcome(alice), outcome(bruno)])
    expect([aliceResult, brunoResult].sort()).toEqual(['confirmed', 'conflict'])

    const loser = aliceResult === 'conflict' ? alice : bruno

    const alternative = loser.page.getByRole('alert').getByRole('button').first()
    await expect(alternative).toBeVisible()
    const conflictUrl = loser.page.url()
    await alternative.click()
    await expect.poll(() => loser.page.url()).not.toBe(conflictUrl)
    await expect(loser.page).toHaveURL(/horario=/)
    await expect(loser.page.locator('#booking-alert')).toHaveCount(0)
    await loser.confirm()
    await expect(
      loser.page.getByRole('heading', { name: text.manage.banners.booked.title }),
    ).toBeVisible()

    await first.close()
    await second.close()
  })
})
