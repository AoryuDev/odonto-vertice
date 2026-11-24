import type { ReactNode } from 'react'

export function StepHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-title text-ink">{title}</h1>
      {children ? <p className="mt-3 text-ink-soft">{children}</p> : null}
    </div>
  )
}
