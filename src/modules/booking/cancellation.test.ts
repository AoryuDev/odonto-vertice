import { describe, expect, it } from 'vitest'
import { parseCancellationNote, patientCancellationCode } from './cancellation'

describe('cancellation notes', () => {
  it('stores patient reasons as language-neutral codes', () => {
    expect(patientCancellationCode()).toBe('patient')
    expect(patientCancellationCode('health_issue')).toBe('patient:health_issue')
  })

  it('reads codes back and keeps free text written by the clinic', () => {
    expect(parseCancellationNote('patient')).toEqual({ kind: 'patient', reason: undefined })
    expect(parseCancellationNote('patient:financial')).toEqual({
      kind: 'patient',
      reason: 'financial',
    })
    expect(parseCancellationNote('patient:unknown')).toEqual({
      kind: 'staff',
      text: 'patient:unknown',
    })
    expect(parseCancellationNote('Paciente ligou desmarcando')).toEqual({
      kind: 'staff',
      text: 'Paciente ligou desmarcando',
    })
  })
})
