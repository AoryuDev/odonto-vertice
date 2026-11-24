import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { ReactNode } from 'react'
import type { Messages } from './messages'

export async function ClientMessages({
  namespaces,
  children,
}: {
  namespaces: readonly (keyof Messages)[]
  children: ReactNode
}) {
  const messages = await getMessages()
  const picked = Object.fromEntries(namespaces.map((namespace) => [namespace, messages[namespace]]))
  return <NextIntlClientProvider messages={picked}>{children}</NextIntlClientProvider>
}
