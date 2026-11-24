import { Link } from '@/i18n/navigation'

export type Crumb = { readonly name: string; readonly path: string }

export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Você está em" className="text-sm text-ink-soft">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.path} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-ink">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="hover:text-ink">
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className="text-line-strong">
                    /
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
