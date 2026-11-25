import { expect, test } from '@playwright/test'
import { expectFullyTranslated, localized, MESSAGES, untranslatedText } from './support/i18n'

test.describe('language routing', () => {
  test('sends a first visit to the browser language and later visits to the saved choice', async ({
    request,
  }) => {
    const first = await request.get('/', {
      headers: { 'accept-language': 'en-US,en;q=0.9' },
      maxRedirects: 0,
    })
    expect(first.status()).toBe(307)
    expect(first.headers().location).toMatch(/\/en$/)

    const portugueseBrowser = await request.get('/', {
      headers: { 'accept-language': 'pt-BR,pt;q=0.9' },
      maxRedirects: 0,
    })
    expect(portugueseBrowser.headers().location).toMatch(/\/pt$/)

    const saved = await request.get('/', {
      headers: { 'accept-language': 'en-US,en;q=0.9', cookie: 'NEXT_LOCALE=pt' },
      maxRedirects: 0,
    })
    expect(saved.headers().location).toMatch(/\/pt$/)
  })

  test('keeps old links working by adding the language prefix', async ({ request }) => {
    const response = await request.get('/tratamentos/limpeza', {
      headers: { 'accept-language': 'pt-BR' },
      maxRedirects: 0,
    })
    expect(response.headers().location).toMatch(/\/pt\/tratamentos\/limpeza$/)
  })
})

test.describe('language switcher on a phone', () => {
  test('lives in the menu, keeps the page and remembers the choice', async ({ page, context }) => {
    await page.goto(localized('pt', '/tratamentos/limpeza'))
    await page.getByRole('button', { name: MESSAGES.pt.mobileNav.open }).click()
    const switcher = page.getByRole('navigation', { name: MESSAGES.pt.localeSwitcher.label })
    await switcher.getByRole('link', { name: 'English' }).click()

    await expect(page).toHaveURL(/\/en\/tratamentos\/limpeza$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1, name: 'Cleaning' })).toBeVisible()
    const cookies = await context.cookies()
    expect(cookies.find((cookie) => cookie.name === 'NEXT_LOCALE')?.value).toBe('en')

    await page.goto('/')
    await expect(page).toHaveURL(/\/en$/)
    await expectFullyTranslated(page)
  })

  test('the untranslated-text check catches Portuguese copy', async ({ page }) => {
    await page.goto(localized('pt', '/tratamentos/limpeza'))

    expect((await untranslatedText(page)).length).toBeGreaterThan(10)
  })

  test('keeps the language on internal links', async ({ page }) => {
    await page.goto(localized('en'))
    const hrefs = await page
      .locator(
        ['main', 'header', 'footer']
          .map((area) => `${area} a[href^="/"]:not([hreflang])`)
          .join(', '),
      )
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))
    expect(hrefs.length).toBeGreaterThan(10)
    expect(hrefs.filter((href) => !/^\/en(?:[/?#]|$)/.test(href))).toEqual([])
  })
})

test.describe('language switcher on a desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false })

  test('is in the header and works with the keyboard and screen readers', async ({ page }) => {
    await page.goto(localized('pt', '/equipe/rafael-tavares'))
    const switcher = page
      .getByRole('banner')
      .getByRole('navigation', { name: MESSAGES.pt.localeSwitcher.label })
    await expect(switcher).toBeVisible()
    const current = switcher.getByRole('link', { name: 'Português' })
    await expect(current).toHaveAttribute('aria-current', 'true')
    const english = switcher.getByRole('link', { name: 'English' })
    await expect(english).toHaveAttribute('lang', 'en')

    await english.focus()
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(/\/en\/equipe\/rafael-tavares$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(
      page
        .getByRole('banner')
        .getByRole('navigation', { name: MESSAGES.en.localeSwitcher.label })
        .getByRole('link', { name: 'English' }),
    ).toHaveAttribute('aria-current', 'true')
    await expectFullyTranslated(page)
  })
})
