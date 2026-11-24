import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/site/logo'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Entrar' }

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-pine-900 p-8 text-paper lg:p-14">
        <Logo tone="inverse" />
        <div className="hidden lg:block">
          <p className="max-w-md font-display text-title">
            A agenda da clínica, do jeito que a recepção precisa.
          </p>
          <p className="mt-4 max-w-md text-pine-200">
            Cada dentista vê só a própria agenda. A recepção vê todas, bloqueia horários e remarca.
          </p>
        </div>
        <p className="hidden text-sm text-pine-300 lg:block">
          Acesso restrito à equipe da Odonto Vértice.
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-title text-ink">Entrar no painel</h1>
          <p className="mt-2 text-ink-soft">Use o e-mail e a senha cadastrados pela clínica.</p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <div className="mt-8 rounded-[var(--radius-soft)] border border-line bg-card p-4 text-sm text-ink-soft">
            <p className="font-medium text-ink">Acesso de demonstração</p>
            <p className="mt-1">
              Recepção: <code className="text-ink">recepcao@odontovertice.example</code>
              <br />
              Dentista: <code className="text-ink">helena@odontovertice.example</code>
              <br />
              Senha: <code className="text-ink">vertice-demo-2026</code>
            </p>
          </div>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Voltar ao site
          </Link>
        </div>
      </div>
    </main>
  )
}
