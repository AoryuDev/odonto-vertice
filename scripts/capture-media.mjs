import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, devices } from '@playwright/test'

const baseURL = process.env.MEDIA_BASE_URL ?? 'http://localhost:3100'
const out = 'docs/media'
const videoDir = join(out, '.video')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()

async function shot(path, file, options = {}) {
  const context = await browser.newContext({
    ...(options.mobile ? devices['Pixel 7'] : { viewport: { width: 1440, height: 900 } }),
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  })
  const page = await context.newPage()
  if (options.login) {
    await page.goto(`${baseURL}/painel/login`)
    await page.getByLabel('E-mail').fill(options.login)
    await page.getByLabel('Senha').fill('vertice-demo-2026')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/\/painel$/)
  }
  await page.goto(`${baseURL}${path}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).first().waitFor()
  await page.screenshot({ path: join(out, file), fullPage: Boolean(options.fullPage) })
  await context.close()
}

await shot('/', 'home-desktop.png')
await shot('/', 'home-mobile.png', { mobile: true })
await shot('/tratamentos/avaliacao-de-implante', 'treatment-desktop.png')
await shot('/agendar/avaliacao/qualquer', 'booking-slots-mobile.png', { mobile: true })
await shot('/painel', 'panel-day.png', { login: 'recepcao@odontovertice.example' })
await shot('/painel?visao=semana', 'panel-week.png', { login: 'recepcao@odontovertice.example' })

rmSync(videoDir, { recursive: true, force: true })
const context = await browser.newContext({
  ...devices['Pixel 7'],
  deviceScaleFactor: 1,
  recordVideo: { dir: videoDir, size: { width: 412, height: 839 } },
})
const page = await context.newPage()
const pause = (ms) => page.waitForTimeout(ms)
const suffix = Date.now().toString(36)

await page.goto(`${baseURL}/`)
await pause(1500)
await page.locator('.fixed.bottom-0').getByRole('link', { name: 'Agendar consulta' }).click()
await page.getByRole('heading', { name: 'Qual consulta você quer marcar?' }).waitFor()
await pause(900)
await page
  .getByRole('main')
  .getByRole('link', { name: /^Limpeza \d/ })
  .click()
await page.getByRole('heading', { name: /Quem vai atender|Com quem/ }).waitFor()
await pause(900)
await page
  .getByRole('main')
  .getByRole('link', { name: /Dra. Helena Prado/ })
  .click()
await page.getByRole('heading', { name: 'Escolha o dia e o horário' }).waitFor()
await pause(900)
await page.locator('nav[aria-label="Escolha o dia"] a').nth(1).click()
await pause(1000)
await page.locator('section[aria-labelledby="horarios-titulo"] a').nth(2).click()
await page.getByRole('heading', { name: 'Seus dados' }).waitFor()
await pause(700)
await page.getByLabel('Nome completo').pressSequentially('Marina Duarte Rocha', { delay: 25 })
await page.getByLabel('E-mail').pressSequentially(`marina.${suffix}@example.com`, { delay: 20 })
await page.getByLabel('Celular com DDD').pressSequentially('62991234567', { delay: 25 })
await page.getByText('Convênio', { exact: true }).click()
await page.getByLabel('Nome do convênio').pressSequentially('Plano Sorriso', { delay: 25 })
await page.getByRole('checkbox', { name: /Autorizo/ }).check()
await pause(500)
await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
await page.getByRole('heading', { name: 'Consulta confirmada' }).waitFor()
await pause(2500)
await context.close()
await browser.close()

const [video] = readdirSync(videoDir).filter((file) => file.endsWith('.webm'))
renameSync(join(videoDir, video), join(videoDir, 'flow.webm'))
execFileSync('ffmpeg', [
  '-v',
  'error',
  '-y',
  '-i',
  join(videoDir, 'flow.webm'),
  '-vf',
  'fps=12,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
  join(out, 'booking-flow.gif'),
])
rmSync(videoDir, { recursive: true, force: true })
console.info('Media written to docs/media')
