'use client'

import { useEffect } from 'react'

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
      <h2 className="font-heading text-xl text-text-primary">Algo salió mal</h2>
      <p className="text-sm text-text-secondary text-center max-w-md">
        Ocurrió un error inesperado. Por favor, intenta nuevamente.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        Intentar nuevamente
      </button>
    </div>
  )
}
