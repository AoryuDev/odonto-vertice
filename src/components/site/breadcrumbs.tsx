import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export type Crumb = { readonly name: string; readonly path: string }

export async function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  const t = await getTranslations('breadcrumbs')
  return (
    <nav aria-label={t('label')} className="text-sm text-ink-soft">
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
