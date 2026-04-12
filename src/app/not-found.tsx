import Link from 'next/link'
import { Compass, Home } from 'lucide-react'
import { Container } from '@/components/ui/Container'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <Container>
          <div className="max-w-lg mx-auto text-center">

            {/* Icon with layered decorative rings */}
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="absolute w-32 h-32 rounded-full bg-primary/5" />
              <div className="absolute w-24 h-24 rounded-full bg-primary/8" />
              <div className="relative w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                <Compass className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
            </div>

            {/* Error code */}
            <p className="font-heading font-bold text-7xl text-primary/20 leading-none mb-2 select-none">
              404
            </p>

            {/* Heading */}
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-primary mb-3 leading-tight">
              Página no encontrada
            </h1>

            {/* Description */}
            <p className="text-stone text-base leading-relaxed mb-8 max-w-sm mx-auto">
              Parece que este sendero no existe. Quizás fue movido,
              renombrado, o nunca llegó a crearse.
            </p>

            {/* Card with links */}
            <div className="bg-cream rounded-2xl border border-stone/10 shadow-sm p-6 mb-6 text-left space-y-3">
              <p className="font-heading font-semibold text-primary text-sm uppercase tracking-wide mb-4">
                Explorá el sitio
              </p>
              {[
                { href: '/lugares', label: 'Lugares turísticos', color: 'text-primary' },
                { href: '/gastronomia', label: 'Gastronomía', color: 'text-accent' },
                { href: '/cultura', label: 'Cultura', color: 'text-secondary' },
                { href: '/agenda', label: 'Agenda de eventos', color: 'text-primary' },
              ].map(({ href, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 text-sm ${color} hover:underline underline-offset-4 transition-colors`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Primary CTA */}
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 bg-primary text-white font-heading font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors text-sm shadow-sm"
            >
              <Home className="w-4 h-4" />
              Volver al inicio
            </Link>

          </div>
        </Container>
      </main>
    </div>
  )
}
