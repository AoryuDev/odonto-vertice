import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Eyebrow({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'inverse'
  className?: string
}) {
  return (
    <p
      className={cn(
        'flex items-center gap-3 text-[0.8rem] font-semibold tracking-[0.14em] uppercase',
        tone === 'default' ? 'text-clay-600' : 'text-clay-200',
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-8 bg-current" />
      {children}
    </p>
  )
}
