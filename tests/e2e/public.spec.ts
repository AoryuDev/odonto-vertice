import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('public site', () => {
  test('home shows the clinic, a live next slot and a booking CTA that stays visible on mobile', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Cuidar dos dentes')
    await expect(page.getByText('Próxima avaliação livre')).toBeVisible()
    const stickyCta = page
      .locator('.fixed.bottom-0')
      .getByRole('link', { name: 'Agendar consulta' })
    await page.mouse.wheel(0, 3000)
    await expect(stickyCta).toBeInViewport()
  })

  test('footer shows the technical lead with CRO-GO and no prices anywhere', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('contentinfo')).toContainText(
      /Responsável técnico: Dra\. Helena Prado Sato — CRO-GO \d+/,
    )
    await expect(page.locator('body')).not.toContainText(/R\$\s?\d/)
    await expect(page.locator('body')).not.toContainText(/promoção|desconto/i)
  })

  test('exposes Dentist structured data with address and opening hours', async ({ page }) => {
    await page.goto('/')

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const dentist = blocks
      .map((block) => JSON.parse(block) as Record<string, unknown>)
      .find((data) => data['@type'] === 'Dentist')
    expect(dentist).toMatchObject({
      name: 'Odonto Vértice',
      address: { addressLocality: 'Goiânia', addressRegion: 'GO' },
      telephone: expect.stringMatching(/^\+55/),
    })
    expect(dentist?.openingHoursSpecification).toHaveLength(6)
  })

  test('treatment and dentist pages are generated from the database', async ({ page }) => {
    await page.goto('/tratamentos/manutencao-de-aparelho')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Manutenção de aparelho' }),
    ).toBeVisible()
    await expect(page.getByText('Consulta de 30 min')).toBeVisible()

    await page.goto('/equipe/rafael-tavares')
    await expect(page.getByRole('heading', { level: 1, name: 'Dr. Rafael Tavares' })).toBeVisible()
    await expect(page.getByRole('row', { name: /Terça-feira/ })).toBeVisible()
  })

  test('serves sitemap and robots for local SEO', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBe(true)
    expect(await sitemap.text()).toContain('/tratamentos/limpeza')

    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /painel')
  })

  for (const path of ['/', '/agendar/limpeza/helena-prado', '/tratamentos/limpeza']) {
    test(`never scrolls sideways on a phone: ${path}`, async ({ page }) => {
      await page.goto(path)

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBe(clientWidth)
    })
  }

  for (const path of [
    '/',
    '/tratamentos/limpeza',
    '/equipe/helena-prado',
    '/agendar',
    '/agendar/limpeza/helena-prado',
    '/painel/login',
  ]) {
    test(`has no detectable WCAG A/AA violations on ${path}`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(
        results.violations.map((violation) => `${violation.id}: ${violation.nodes.length}`),
      ).toEqual([])
    })
  }
})
