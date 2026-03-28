import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Descubre la riqueza turística, cultural y gastronómica de Tepexi de Rodríguez, Puebla.',
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-cream py-24 md:py-36">
        <Container className="text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6">
            Descubre Tepexi de Rodríguez
          </h1>
          <p className="text-stone text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Explora la riqueza turística, cultural y gastronómica de nuestro
            municipio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/lugares">Explorar lugares</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/mapa">Ver mapa</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Featured places */}
      <section className="py-20">
        <Container>
          <h2 className="font-heading font-bold text-3xl text-primary mb-4">
            Lugares destacados
          </h2>
          <p className="text-stone">Próximamente</p>
        </Container>
      </section>

      {/* Events */}
      <section className="bg-cream py-20">
        <Container>
          <h2 className="font-heading font-bold text-3xl text-primary mb-4">
            Agenda cultural
          </h2>
          <p className="text-stone">Próximamente</p>
        </Container>
      </section>

      {/* Gastronomy */}
      <section className="py-20">
        <Container>
          <h2 className="font-heading font-bold text-3xl text-primary mb-4">
            Gastronomía local
          </h2>
          <p className="text-stone">Próximamente</p>
        </Container>
      </section>
    </>
  )
}
