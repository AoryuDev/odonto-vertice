import { createHash, createHmac } from 'node:crypto'

export type ManageToken = { readonly token: string; readonly hash: string }

export function hashManageToken(token: string): string {
  return `\\x${createHash('sha256').update(token, 'utf8').digest('hex')}`
}

export function manageTokenFor(appointmentId: string, secret: string): ManageToken {
  const token = createHmac('sha256', secret).update(appointmentId, 'utf8').digest('base64url')
  return { token, hash: hashManageToken(token) }
}
