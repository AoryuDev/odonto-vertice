import { z } from 'zod'
import { routing } from './routing'

export const localeSchema = z.enum(routing.locales)
