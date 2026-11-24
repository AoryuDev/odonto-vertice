'use client'

import { Button, ButtonLink } from '@/components/ui/button'

export default function MarketingError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="container-page py-24">
      <h1 className="text-title text-ink">Não conseguimos carregar esta página.</h1>
      <p className="mt-5 max-w-xl text-ink-soft">
        Pode ser uma instabilidade momentânea. Tente novamente ou fale com a recepção pelo telefone
        (62) 3920-4815.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <ButtonLink href="/" variant="secondary">
          Ir para o início
        </ButtonLink>
      </div>
    </section>
  )
}
