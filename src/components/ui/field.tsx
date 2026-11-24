import type { ReactNode } from 'react'
import { AlertIcon } from './icons'

export const inputClasses =
  'block w-full rounded-[0.8rem] border border-line-strong bg-card px-4 py-3 text-base text-ink placeholder:text-ink-soft/70 transition-colors hover:border-ink-soft focus:border-pine-800 focus:outline-2 focus:outline-offset-0 focus:outline-pine-800/30 aria-[invalid=true]:border-clay-600'

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between text-[0.95rem] font-medium text-ink"
      >
        {label}
        {optional ? <span className="text-sm font-normal text-ink-soft">opcional</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  )
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm text-clay-700">
      <AlertIcon size={16} className="mt-0.5 shrink-0" />
      {children}
    </p>
  )
}

export function describedBy(
  id: string,
  options: { hint?: boolean; error?: boolean },
): string | undefined {
  const ids = [options.hint ? `${id}-hint` : null, options.error ? `${id}-error` : null].filter(
    Boolean,
  )
  return ids.length ? ids.join(' ') : undefined
}
