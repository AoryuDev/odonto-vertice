import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { CATALOG, format, LOCALES, localized, MESSAGES, plain } from './support/i18n'

for (const locale of LOCALES) {
  const text = MESSAGES[locale]
  const catalog = CATALOG[locale]

  test.describe(`public site (${locale})`, () => {
    test('home shows the clinic, a live next slot and a booking CTA that stays visible on mobile', async ({
      page,
    }) => {
      await page.goto(localized(locale))

      await expect(page.locator('html')).toHaveAttribute('lang', locale === 'pt' ? 'pt-BR' : 'en')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(plain(text.home.hero.title))
      await expect(page.getByRole('main').getByText(text.home.nextSlot.eyebrow)).toBeVisible()
      const stickyCta = page
        .locator('.fixed.bottom-0')
        .getByRole('link', { name: text.mobileBar.book })
      await page.mouse.wheel(0, 3000)
      await expect(stickyCta).toBeInViewport()
    })

    test('footer shows the technical lead with CRO-GO and no prices anywhere', async ({ page }) => {
      await page.goto(localized(locale))

      await expect(page.getByRole('contentinfo')).toContainText(
        new RegExp(`${text.footer.technicalLead} ${catalog.leadFullTitle} — CRO-GO \\d+`),
      )
      await expect(page.locator('body')).not.toContainText(/R\$\s?\d/)
      await expect(page.locator('body')).not.toContainText(/promoção|desconto|discount|sale/i)
    })

    test('exposes Dentist structured data with address, hours and localized URLs', async ({
      page,
    }) => {
      await page.goto(localized(locale))

      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
      const dentist = blocks
        .map((block) => JSON.parse(block) as Record<string, unknown>)
        .find((data) => data['@type'] === 'Dentist')
      expect(dentist).toMatchObject({
        name: 'Odonto Vértice',
        url: expect.stringMatching(new RegExp(`/${locale}$`)),
        paymentAccepted: text.seo.paymentAccepted,
        address: { addressLocality: 'Goiânia', addressRegion: 'GO' },
        telephone: expect.stringMatching(/^\+55/),
      })
      expect(dentist?.openingHoursSpecification).toHaveLength(6)
    })

    test('declares the canonical URL and hreflang alternates with x-default in Portuguese', async ({
      page,
    }) => {
      await page.goto(localized(locale, '/tratamentos/limpeza'))

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`/${locale}/tratamentos/limpeza$`),
      )
      const alternates = page.locator('link[rel="alternate"][hreflang]')
      await expect(alternates.and(page.locator('[hreflang="pt-BR"]'))).toHaveAttribute(
        'href',
        /\/pt\/tratamentos\/limpeza$/,
      )
      await expect(alternates.and(page.locator('[hreflang="en"]'))).toHaveAttribute(
        'href',
        /\/en\/tratamentos\/limpeza$/,
      )
      await expect(alternates.and(page.locator('[hreflang="x-default"]'))).toHaveAttribute(
        'href',
        /\/pt\/tratamentos\/limpeza$/,
      )
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
        'content',
        locale === 'pt' ? 'pt_BR' : 'en_US',
      )
    })

    test('treatment and dentist pages are generated from the database', async ({ page }) => {
      await page.goto(localized(locale, '/tratamentos/manutencao-de-aparelho'))
      await expect(
        page.getByRole('heading', { level: 1, name: catalog.bracesAdjustment }),
      ).toBeVisible()
      await expect(
        page
          .getByRole('main')
          .getByText(format(text.treatmentPage.duration, { duration: catalog.thirtyMinutes })),
      ).toBeVisible()

      await page.goto(localized(locale, '/equipe/rafael-tavares'))
      await expect(page.getByRole('heading', { level: 1, name: catalog.rafael })).toBeVisible()
      await expect(page.getByRole('row', { name: new RegExp(catalog.tuesday) })).toBeVisible()
    })

    for (const path of ['/', '/agendar/limpeza/helena-prado', '/tratamentos/limpeza']) {
      test(`never scrolls sideways on a phone: ${path}`, async ({ page }) => {
        await page.goto(localized(locale, path))

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
        await page.goto(localized(locale, path))
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
}

test.describe('local SEO files', () => {
  test('serve a sitemap with both languages and robots rules for private pages', async ({
    request,
  }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/pt/tratamentos/limpeza</loc>')
    expect(sitemap).toContain('/en/tratamentos/limpeza</loc>')
    expect(sitemap).toMatch(/hreflang="x-default" href="[^"]+\/pt\/tratamentos\/limpeza"/)

    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /painel')
    expect(robots).toContain('Disallow: /en/painel')
  })
})
