import { Link } from '@/i18n/navigation'
import { LogoMark } from '@/components/ui/icons'
import { cn } from '@/lib/cn'

export function Logo({ tone = 'default' }: { tone?: 'default' | 'inverse' }) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex shrink-0 items-center gap-2.5 rounded-md',
        tone === 'default' ? 'text-pine-900' : 'text-paper',
      )}
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="font-display text-[1.35rem] leading-none tracking-[-0.01em] whitespace-nowrap">
        Odonto <span className="italic">Vértice</span>
      </span>
    </Link>
  )
}
