import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponte en contacto con el equipo de Tepexi Digital.',
}

export default function ContactoPage() {
  return (
    <>
      <section className="bg-cream py-16">
        <Container>
          <h1 className="font-heading font-bold text-4xl text-primary mb-3">
            Contacto
          </h1>
          <p className="text-stone text-lg max-w-2xl">
            ¿Tienes preguntas o sugerencias? Escríbenos y te responderemos a la brevedad.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact form */}
            <div>
              <h2 className="font-heading font-semibold text-primary text-2xl mb-6">
                Envíanos un mensaje
              </h2>
              <ContactForm />
            </div>

            {/* Contact info */}
            <div className="space-y-6">
              <h2 className="font-heading font-semibold text-primary text-2xl">
                Información de contacto
              </h2>

              <div className="space-y-4 text-stone">
                <div className="bg-cream rounded-lg border border-stone/10 p-5 space-y-1">
                  <h3 className="font-medium text-primary">Ubicación</h3>
                  <p className="text-sm">
                    Tepexi de Rodríguez, Puebla, México.
                  </p>
                </div>

                <div className="bg-cream rounded-lg border border-stone/10 p-5 space-y-1">
                  <h3 className="font-medium text-primary">Correo electrónico</h3>
                  <a
                    href="mailto:contacto@tepexidigital.com"
                    className="text-sm hover:text-primary transition-colors"
                  >
                    contacto@tepexidigital.com
                  </a>
                </div>

                <div className="bg-cream rounded-lg border border-stone/10 p-5 space-y-1">
                  <h3 className="font-medium text-primary">Redes sociales</h3>
                  <p className="text-sm">Próximamente.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
