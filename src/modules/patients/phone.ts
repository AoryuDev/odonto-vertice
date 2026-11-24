const DDD_PATTERN = /^[1-9][1-9]$/

export function normalizeBrazilianPhone(raw: string): string | undefined {
  const digits = raw.replace(/\D/g, '')
  const national = digits.length > 11 && digits.startsWith('55') ? digits.slice(2) : digits
  if (national.length !== 10 && national.length !== 11) return undefined

  const ddd = national.slice(0, 2)
  const subscriber = national.slice(2)
  if (!DDD_PATTERN.test(ddd)) return undefined
  if (subscriber.length === 9 && !subscriber.startsWith('9')) return undefined
  if (subscriber.length === 8 && !/^[2-5]/.test(subscriber)) return undefined

  return `+55${ddd}${subscriber}`
}

export function formatBrazilianPhone(e164: string): string {
  const national = e164.replace(/^\+55/, '')
  const ddd = national.slice(0, 2)
  const subscriber = national.slice(2)
  const split = subscriber.length === 9 ? 5 : 4
  return `(${ddd}) ${subscriber.slice(0, split)}-${subscriber.slice(split)}`
}

export function maskBrazilianPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  const split = rest.length > 8 ? 5 : 4
  if (rest.length <= split) return `(${ddd}) ${rest}`
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`
}
