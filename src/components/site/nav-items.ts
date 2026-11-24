import type { Messages } from '@/i18n/messages'

export type NavItemKey = keyof Messages['header']['nav']

export type NavItem = { readonly href: string; readonly label: string }

export const NAV_ITEMS: readonly { readonly href: string; readonly key: NavItemKey }[] = [
  { href: '/#tratamentos', key: 'treatments' },
  { href: '/#equipe', key: 'team' },
  { href: '/#como-trabalhamos', key: 'approach' },
  { href: '/#duvidas', key: 'faq' },
  { href: '/#localizacao', key: 'location' },
]
