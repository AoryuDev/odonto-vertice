import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { hashManageToken, manageTokenFor } from './manage-token'
import { manageTokenSchema } from './schemas'

const SECRET = 'test-secret-with-at-least-thirty-two-characters'

describe('manage tokens', () => {
  it('derives a 256-bit url-safe token that passes the request schema', () => {
    const { token } = manageTokenFor(randomUUID(), SECRET)

    expect(manageTokenSchema.safeParse(token).success).toBe(true)
  })

  it('is reproducible, so reminders can link back to the same appointment', () => {
    const id = randomUUID()

    expect(manageTokenFor(id, SECRET)).toEqual(manageTokenFor(id, SECRET))
  })

  it('changes with the appointment and with the secret', () => {
    const id = randomUUID()

    expect(manageTokenFor(id, SECRET).token).not.toBe(manageTokenFor(randomUUID(), SECRET).token)
    expect(manageTokenFor(id, SECRET).token).not.toBe(manageTokenFor(id, `${SECRET}!`).token)
  })

  it('stores only a SHA-256 digest of the token in Postgres hex format', () => {
    const { token, hash } = manageTokenFor(randomUUID(), SECRET)

    expect(hash).toMatch(/^\\x[0-9a-f]{64}$/)
    expect(hashManageToken(token)).toBe(hash)
    expect(hash).not.toContain(token)
  })
})
