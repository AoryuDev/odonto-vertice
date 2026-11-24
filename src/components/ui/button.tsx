import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'quiet' | 'inverse'
type Size = 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-pine-800 text-paper hover:bg-pine-900 active:bg-pine-950 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]',
  secondary: 'border border-line-strong text-ink hover:border-ink hover:bg-card',
  quiet: 'text-pine-800 underline decoration-pine-300 underline-offset-4 hover:decoration-pine-800',
  inverse: 'bg-paper text-pine-900 hover:bg-card',
}

const SIZES: Record<Size, string> = {
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-13 px-7 text-base',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md'): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 select-none disabled:cursor-not-allowed disabled:opacity-60',
    variant !== 'quiet' && SIZES[size],
    VARIANTS[variant],
  )
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function ButtonLink({ variant, size, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClasses(variant, size), className)} {...props}>
      {children}
    </Link>
  )
}

type ButtonProps = ComponentProps<'button'> & { variant?: Variant; size?: Size }

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonClasses(variant, size), className)} {...props} />
}
