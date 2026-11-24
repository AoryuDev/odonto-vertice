import 'server-only'
import { z } from 'zod'

const serverEnvSchema = z
  .object({
    SUPABASE_URL: z.url(),
    SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
    SUPABASE_SECRET_KEY: z.string().min(20),
    MANAGE_TOKEN_SECRET: z.string().min(32),
    BOOKING_RATE_LIMIT: z.coerce.number().int().positive().default(10),
    CRON_SECRET: z.string().min(32).optional(),
    NOTIFICATION_CHANNEL: z.enum(['console', 'email']).default('console'),
    RESEND_API_KEY: z.string().min(10).optional(),
    EMAIL_FROM: z.string().min(5).optional(),
  })
  .refine((env) => env.NOTIFICATION_CHANNEL !== 'email' || (env.RESEND_API_KEY && env.EMAIL_FROM), {
    message: 'RESEND_API_KEY and EMAIL_FROM are required when NOTIFICATION_CHANNEL=email',
  })

export type ServerEnv = z.infer<typeof serverEnvSchema>

let cached: ServerEnv | undefined

function emptyToUndefined(source: NodeJS.ProcessEnv): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, value === '' ? undefined : value]),
  )
}

export function serverEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse(emptyToUndefined(process.env))
  return cached
}
