import { timingSafeEqual } from 'node:crypto'
import { connection } from 'next/server'
import { serverEnv } from '@/lib/env'
import { runDailyReminders } from '@/modules/notifications/reminders.server'

export const maxDuration = 60

function authorized(request: Request): boolean {
  const secret = serverEnv().CRON_SECRET
  const header = request.headers.get('authorization') ?? ''
  if (!secret) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(header)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

async function handle(request: Request): Promise<Response> {
  await connection()
  if (!authorized(request)) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const run = await runDailyReminders(new Date())
  console.info(`Reminders: claimed ${run.claimed}, sent ${run.sent}, failed ${run.failed}`)
  return Response.json({
    window: { from: run.window.from.toISOString(), to: run.window.to.toISOString() },
    claimed: run.claimed,
    sent: run.sent,
    failed: run.failed,
  })
}

export const GET = handle
export const POST = handle
