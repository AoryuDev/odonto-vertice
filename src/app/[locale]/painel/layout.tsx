import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { ClientMessages } from '@/i18n/client-messages'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('panel.meta')
  return {
    title: { default: t('title'), template: t('template') },
    robots: { index: false, follow: false },
  }
}

const PANEL_NAMESPACES = ['localeSwitcher', 'field', 'validation', 'panel', 'errorPage'] as const

export default function PanelRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <ClientMessages namespaces={PANEL_NAMESPACES}>{children}</ClientMessages>
    </div>
  )
}
