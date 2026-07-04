export default function Loading() {
  return (
    <div role="status" className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-heading text-lg text-text-primary">Cargando contenido…</p>
        <p className="text-sm text-text-secondary">
          Estamos preparando la información turística para tu visita.
        </p>
        <span className="sr-only">Cargando contenido…</span>
      </div>
    </div>
  )
}
