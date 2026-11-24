import type { Metadata } from 'next'
import { Logo } from '@/components/site/logo'
import { ButtonLink } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Página não encontrada' }

export default function NotFound() {
  return (
    <main className="container-page flex min-h-dvh flex-col justify-center py-16">
      <Logo />
      <p className="mt-16 text-sm font-semibold tracking-[0.14em] text-clay-600 uppercase">
        Erro 404
      </p>
      <h1 className="mt-4 max-w-2xl text-title text-ink">
        Essa página não existe, ou mudou de endereço.
      </h1>
      <p className="mt-5 max-w-xl text-ink-soft">
        Se você chegou aqui por um link de agendamento, confira se o endereço foi copiado inteiro.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Voltar ao início</ButtonLink>
        <ButtonLink href="/agendar" variant="secondary">
          Agendar consulta
        </ButtonLink>
      </div>
    </main>
  )
}
