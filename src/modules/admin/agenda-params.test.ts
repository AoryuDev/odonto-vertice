import { describe, expect, it } from 'vitest'
import { agendaHref, parseAgendaParams } from './agenda-params'

describe('agenda params', () => {
  it('defaults to the day view without cancelled appointments', () => {
    expect(parseAgendaParams({})).toEqual({
      date: undefined,
      view: 'dia',
      dentist: undefined,
      showCancelled: false,
    })
  })

  it('reads a full query and discards invalid values', () => {
    expect(
      parseAgendaParams({
        data: '2026-11-25',
        visao: 'semana',
        dentista: 'helena-prado',
        canceladas: '1',
      }),
    ).toEqual({ date: '2026-11-25', view: 'semana', dentist: 'helena-prado', showCancelled: true })
    expect(parseAgendaParams({ data: '2026-13-01', visao: 'mes', dentista: '<x>' })).toEqual({
      date: undefined,
      view: 'dia',
      dentist: undefined,
      showCancelled: false,
    })
  })

  it('builds minimal agenda URLs', () => {
    expect(agendaHref({ date: '2026-11-25' as never })).toBe('/painel?data=2026-11-25')
    expect(
      agendaHref({
        date: '2026-11-25' as never,
        view: 'semana',
        dentist: 'camila-arantes',
        showCancelled: true,
      }),
    ).toBe('/painel?data=2026-11-25&visao=semana&dentista=camila-arantes&canceladas=1')
  })
})
