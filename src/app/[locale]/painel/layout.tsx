import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: { default: 'Painel', template: '%s · Painel Odonto Vértice' },
  robots: { index: false, follow: false },
}

export default function PanelRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-paper">{children}</div>
}
