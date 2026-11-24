import { Suspense } from 'react'
import { LocaleSwitcher, LocaleSwitcherFallback } from './locale-switcher'

export function LocaleSwitcherSlot({ variant }: { variant?: 'compact' | 'full' | 'inverse' }) {
  return (
    <Suspense fallback={<LocaleSwitcherFallback variant={variant} />}>
      <LocaleSwitcher variant={variant} />
    </Suspense>
  )
}
