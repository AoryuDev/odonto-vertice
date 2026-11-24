import { describe, expect, it } from 'vitest'
import { formatBrazilianPhone, maskBrazilianPhoneInput, normalizeBrazilianPhone } from './phone'

describe('normalizeBrazilianPhone', () => {
  it.each([
    ['(62) 99123-4567', '+5562991234567'],
    ['62991234567', '+5562991234567'],
    ['+55 62 99123-4567', '+5562991234567'],
    ['(62) 3251-4870', '+556232514870'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeBrazilianPhone(input)).toBe(expected)
  })

  it.each([
    ['too short', '9912-3456'],
    ['invalid area code', '(01) 99123-4567'],
    ['mobile without leading 9', '(62) 89123-4567'],
    ['landline starting with 9', '(62) 9251-4870'],
    ['too long', '+55 62 99123-45678'],
  ])('rejects a %s number', (_label, input) => {
    expect(normalizeBrazilianPhone(input)).toBeUndefined()
  })
})

describe('formatting', () => {
  it('formats mobile and landline numbers for display', () => {
    expect(formatBrazilianPhone('+5562991234567')).toBe('(62) 99123-4567')
    expect(formatBrazilianPhone('+556232514870')).toBe('(62) 3251-4870')
  })

  it('masks partial input while the patient types', () => {
    expect(maskBrazilianPhoneInput('6')).toBe('(6')
    expect(maskBrazilianPhoneInput('6299')).toBe('(62) 99')
    expect(maskBrazilianPhoneInput('629912345')).toBe('(62) 9912-345')
    expect(maskBrazilianPhoneInput('62991234567')).toBe('(62) 99123-4567')
  })
})
