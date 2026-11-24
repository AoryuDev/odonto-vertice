import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { writeFileSync } from 'node:fs'

const status = JSON.parse(
  execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'json'], { encoding: 'utf8' }),
)

const env = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  SUPABASE_URL: status.API_URL,
  SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: status.SECRET_KEY,
  MANAGE_TOKEN_SECRET: randomBytes(32).toString('hex'),
  CRON_SECRET: randomBytes(32).toString('hex'),
  NOTIFICATION_CHANNEL: 'console',
  BOOKING_RATE_LIMIT: process.env.BOOKING_RATE_LIMIT ?? '500',
}

writeFileSync(
  '.env.local',
  `${Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`,
)
console.info('Wrote .env.local for the local Supabase stack')
