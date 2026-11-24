import { expect, test } from '@playwright/test'
import { BookingFlow, uniquePatient } from './pages/booking-flow'

test.describe('double booking protection', () => {
  test('two patients confirming the same slot at the same time get exactly one appointment', async ({
    browser,
  }) => {
    const first = await browser.newContext()
    const second = await browser.newContext()
    const alice = new BookingFlow(await first.newPage())
    const bruno = new BookingFlow(await second.newPage())

    await alice.open('?tratamento=manutencao-de-aparelho&dentista=rafael-tavares')
    const slotHref = await alice.chooseFirstSlot()
    await bruno.page.goto(slotHref)
    await expect(bruno.page.getByRole('heading', { name: 'Seus dados' })).toBeVisible()

    await alice.fillPatient(uniquePatient('alice'))
    await bruno.fillPatient(uniquePatient('bruno'))

    await Promise.all([alice.confirm(), bruno.confirm()])

    const outcome = async (flow: BookingFlow) => {
      const confirmed = flow.page.getByRole('heading', { name: 'Consulta confirmada' })
      const conflict = flow.page.getByText(
        'Esse horário acabou de ser reservado por outra pessoa.',
        { exact: false },
      )
      await expect(confirmed.or(conflict)).toBeVisible()
      return (await confirmed.isVisible()) ? 'confirmed' : 'conflict'
    }

    const [aliceResult, brunoResult] = await Promise.all([outcome(alice), outcome(bruno)])
    expect([aliceResult, brunoResult].sort()).toEqual(['confirmed', 'conflict'])

    const loser = aliceResult === 'conflict' ? alice : bruno

    const alternative = loser.page.getByRole('alert').getByRole('button').first()
    await expect(alternative).toBeVisible()
    await alternative.click()
    await expect(loser.page).toHaveURL(/horario=/)
    await loser.confirm()
    await expect(loser.page.getByRole('heading', { name: 'Consulta confirmada' })).toBeVisible()

    await first.close()
    await second.close()
  })
})
