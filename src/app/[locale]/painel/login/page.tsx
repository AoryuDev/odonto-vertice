import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LocaleSwitcherSlot } from '@/components/site/locale-switcher-slot'
import { Logo } from '@/components/site/logo'
import { Link } from '@/i18n/navigation'
import { LoginForm } from './login-form'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('panel.meta')
  return { title: t('login') }
}

export default async function LoginPage() {
  const t = await getTranslations('panel.login')
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-pine-900 p-8 text-paper lg:p-14">
        <div className="flex items-center justify-between gap-4">
          <Logo tone="inverse" />
          <LocaleSwitcherSlot variant="inverse" />
        </div>
        <div className="hidden lg:block">
          <p className="max-w-md font-display text-title">{t('tagline')}</p>
          <p className="mt-4 max-w-md text-pine-200">{t('pitch')}</p>
        </div>
        <p className="hidden text-sm text-pine-300 lg:block">{t('restricted')}</p>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-title text-ink">{t('title')}</h1>
          <p className="mt-2 text-ink-soft">{t('body')}</p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <div className="mt-8 rounded-[var(--radius-soft)] border border-line bg-card p-4 text-sm text-ink-soft">
            <p className="font-medium text-ink">{t('demoTitle')}</p>
            <p className="mt-1">
              {t('demoReception')} <code className="text-ink">recepcao@odontovertice.example</code>
              <br />
              {t('demoDentist')} <code className="text-ink">helena@odontovertice.example</code>
              <br />
              {t('demoPassword')} <code className="text-ink">vertice-demo-2026</code>
            </p>
          </div>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            {t('back')}
          </Link>
        </div>
      </div>
    </main>
  )
}
