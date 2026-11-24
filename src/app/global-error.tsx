'use client'

import './globals.css'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body>
        <main className="container-page flex min-h-dvh flex-col justify-center py-16">
          <h1 className="text-title text-ink">Algo deu errado do nosso lado.</h1>
          <p className="mt-5 max-w-xl text-ink-soft">
            Tente de novo em alguns segundos. Se precisar marcar uma consulta agora, ligue para (62)
            3920-4815.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 h-11 w-fit rounded-full bg-pine-800 px-5 text-paper"
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  )
}
