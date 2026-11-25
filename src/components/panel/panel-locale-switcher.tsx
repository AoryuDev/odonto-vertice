'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { setStaffLocale } from '@/app/[locale]/painel/actions'
import { LocaleItemLabel, localeItemClass } from '@/components/site/locale-switcher'
import { HTML_LANG } from '@/i18n/locales'
import { usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function PanelLocaleSwitcher() {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  return <PanelLocaleForm path={search ? `${pathname}?${search}` : pathname} />
}

export function PanelLocaleForm({ path }: { path: string }) {
  const t = useTranslations('localeSwitcher')
  return (
    <nav aria-label={t('label')}>
      <form action={setStaffLocale}>
        <input type="hidden" name="path" value={path} />
        <LocaleButtons />
      </form>
    </nav>
  )
}

function LocaleButtons() {
  const active = useLocale()
  const t = useTranslations('panel.localeSwitcher')
  const { pending } = useFormStatus()
  return (
    <ul className="flex items-center gap-0.5" aria-busy={pending || undefined}>
      {routing.locales.map((locale) => {
        const current = locale === active
        return (
          <li key={locale}>
            <button
              type="submit"
              name="locale"
              value={locale}
              lang={HTML_LANG[locale]}
              aria-current={current ? 'true' : undefined}
              disabled={pending}
              className={localeItemClass('compact', current)}
            >
              <LocaleItemLabel variant="compact" locale={locale} />
            </button>
          </li>
        )
      })}
      {pending ? (
        <li role="status" className="sr-only">
          {t('saving')}
        </li>
      ) : null}
    </ul>
  )
}
