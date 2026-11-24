import type { Messages } from './messages'

export type ValidationKey = keyof Messages['validation']

export function issue(key: ValidationKey): ValidationKey {
  return key
}
