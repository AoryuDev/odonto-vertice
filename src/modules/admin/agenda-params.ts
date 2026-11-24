import { z } from 'zod'
import { isLocalDate, type LocalDate } from '@/modules/schedule/domain/clinic-time'

export type AgendaView = 'dia' | 'semana'

export type AgendaParams = {
  readonly date: LocalDate | undefined
  readonly view: AgendaView
  readonly dentist: string | undefined
  readonly showCancelled: boolean
}

const single = (value: unknown) => (Array.isArray(value) ? value[0] : value)

const schema = z.object({
  data: z.preprocess(single, z.string().refine(isLocalDate).optional().catch(undefined)),
  visao: z.preprocess(single, z.enum(['dia', 'semana']).catch('dia')),
  dentista: z.preprocess(
    single,
    z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional()
      .catch(undefined),
  ),
  canceladas: z.preprocess(single, z.literal('1').optional().catch(undefined)),
})

export function parseAgendaParams(
  raw: Record<string, string | string[] | undefined>,
): AgendaParams {
  const parsed = schema.parse(raw)
  return {
    date: parsed.data as LocalDate | undefined,
    view: parsed.visao,
    dentist: parsed.dentista,
    showCancelled: parsed.canceladas === '1',
  }
}

export function agendaHref(params: Partial<AgendaParams> & { date: LocalDate }): string {
  const search = new URLSearchParams({ data: params.date })
  if (params.view && params.view !== 'dia') search.set('visao', params.view)
  if (params.dentist) search.set('dentista', params.dentist)
  if (params.showCancelled) search.set('canceladas', '1')
  return `/painel?${search.toString()}`
}
