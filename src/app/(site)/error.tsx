'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <div role="alert" className="flex max-w-md flex-col items-center gap-4 text-center">
        <h2 className="font-heading text-xl text-text-primary">No pudimos cargar esta sección</h2>
        <p className="text-sm text-text-secondary text-center max-w-md">
          Ocurrió un error inesperado. Intenta nuevamente o regresa al inicio para seguir explorando el sitio.
        </p>
      </div>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-lg border border-primary/20 px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
